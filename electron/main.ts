import path from "node:path";
import fs from "node:fs";
import { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, Notification, screen, Tray } from "electron";
import { createStorage } from "./storage";

const overlaySize = { width: 420, height: 280 };
const isMac = process.platform === "darwin";

let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let hideTimer: NodeJS.Timeout | null = null;
let onboardingMessage: string | null = null;
let suppressHideUntil = 0;
const nudgeAccelerators = [
  { accelerator: "CommandOrControl+Left", dx: -8, dy: 0 },
  { accelerator: "CommandOrControl+Right", dx: 8, dy: 0 },
  { accelerator: "CommandOrControl+Up", dx: 0, dy: -8 },
  { accelerator: "CommandOrControl+Down", dx: 0, dy: 8 },
  { accelerator: "CommandOrControl+Shift+Left", dx: -14, dy: 0 },
  { accelerator: "CommandOrControl+Shift+Right", dx: 14, dy: 0 },
  { accelerator: "CommandOrControl+Shift+Up", dx: 0, dy: -14 },
  { accelerator: "CommandOrControl+Shift+Down", dx: 0, dy: 14 },
];
const storage = createStorage(app.getPath("userData"));

const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) {
  app.quit();
  process.exit(0);
}

app.on("second-instance", () => {
  showOverlay();
});

const rendererUrl =
  process.env.VITE_DEV_SERVER_URL ??
  `file://${path.join(__dirname, "../dist/index.html")}`;
const preloadPath = path.join(__dirname, "preload.cjs");

const setShortcut = () => {
  const shortcut = isMac ? "Command+Shift+J" : "Control+Shift+J";
  const ok = globalShortcut.register(shortcut, () => toggleOverlay());
  if (!ok) {
    console.warn("[overlay] Failed to register global shortcut");
  }
};

const getOverlayPosition = () => {
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const { x, y, width, height } = display.workArea;

  const clampedX = Math.min(Math.max(cursor.x - overlaySize.width / 2, x), x + width - overlaySize.width);
  const clampedY = Math.min(Math.max(cursor.y - overlaySize.height / 2, y), y + height - overlaySize.height);

  if (Number.isFinite(clampedX) && Number.isFinite(clampedY)) {
    return { x: Math.round(clampedX), y: Math.round(clampedY) };
  }

  return {
    x: Math.round(x + width / 2 - overlaySize.width / 2),
    y: Math.round(y + height / 2 - overlaySize.height / 2),
  };
};

const createOverlayWindow = () => {
  overlayWindow = new BrowserWindow({
    width: overlaySize.width,
    height: overlaySize.height,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    hasShadow: true,
    skipTaskbar: true,
    roundedCorners: true,
    fullscreenable: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setMenuBarVisibility(false);
  overlayWindow.setSkipTaskbar(true);

  overlayWindow.on("blur", () => {
    if (Date.now() < suppressHideUntil) return;
    hideTimer = setTimeout(() => hideOverlay(), 300);
  });

  overlayWindow.on("focus", () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
  });

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  overlayWindow.loadURL(rendererUrl);
};

const showOverlay = () => {
  if (!overlayWindow) createOverlayWindow();
  if (!overlayWindow) return;

  const present = () => {
    if (!overlayWindow) return;
    const { x, y } = getOverlayPosition();
    overlayWindow.setBounds({ x, y, width: overlaySize.width, height: overlaySize.height });
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.show();
    overlayWindow.focus();
    overlayWindow.webContents.focus();
    overlayWindow.webContents.send("overlay-visible");
    if (onboardingMessage) {
      overlayWindow.webContents.send("onboarding", onboardingMessage);
      onboardingMessage = null;
    }
    registerNudgeShortcuts();
  };

  if (overlayWindow.webContents.isLoading()) {
    overlayWindow.webContents.once("did-finish-load", () => present());
    return;
  }

  present();
};

const hideOverlay = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (!overlayWindow) return;
  overlayWindow.hide();
  overlayWindow.webContents.send("overlay-hidden");
  unregisterNudgeShortcuts();
};

const nudgeOverlay = (deltaX: number, deltaY: number) => {
  if (!overlayWindow) return;
  const bounds = overlayWindow.getBounds();
  const display = screen.getDisplayMatching(bounds);
  const { x, y, width, height } = display.workArea;
  const next = {
    x: Math.min(Math.max(bounds.x + deltaX, x), x + width - bounds.width),
    y: Math.min(Math.max(bounds.y + deltaY, y), y + height - bounds.height),
  };
  overlayWindow.setBounds({ ...bounds, ...next });
  suppressHideUntil = Date.now() + 800;
  overlayWindow.focus();
  overlayWindow.webContents.focus();
};

const toggleOverlay = () => {
  if (!overlayWindow) {
    showOverlay();
    return;
  }

  if (overlayWindow.isVisible()) {
    hideOverlay();
  } else {
    showOverlay();
  }
};

const createTray = () => {
  const trayImage = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABOlBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8Vah/9AAAAUHRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlteX2BhYnN4IAoAAADuSURBVFjD7dTZUsIwEIDh3aRAEOIlBDCUqVSpWv3/W5SQYDEzM/PzPZkzNEIFxXb7HP35bLE8QAIvVLD9Jqlettbdx5CmwzPXLtLySdV3+YyFSLJTpORIUVkBRCYkVyXJoViay3hV5GOQayUv+SBAkB6LG2F2d9hCkDM7JNDd2iuNW074BnLfCgL6D6TS+86SbaZFAiKc36q5w0dGiupcFJM4oeKZAzh9wWzuM7hB5TtqDobGO4MR0M+Mgj1QLLcznd4wz2e2GRrbnO+mQmIEotUtV+IDXLiIDd2vAg+OFQE9o/Sg0VqVWtrnZwUTMDrazNRYoeCPeXprrh24NHUZ4A8MVDdKgr+vMmcVuXfV0RLlR4gqXbtzSc+PumN++kXibSu66F/wDNA/SUZlr3zQAAAABJRU5ErkJggg==",
  );
  trayImage.setTemplateImage(true);

  tray = new Tray(trayImage);
  const menu = Menu.buildFromTemplate([
    {
      label: "Open Journal",
      click: () => showOverlay(),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip("Glass Journal Overlay");
  tray.on("click", () => toggleOverlay());
};

const sendOnboardingToast = () => {
  const settingsPath = path.join(app.getPath("userData"), "settings.json");
  let shouldShow = true;
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      shouldShow = !settings.onboardingSeen;
    } catch {
      shouldShow = true;
    }
  }

  if (!shouldShow) return;

  const message = isMac ? "Press Cmd + Shift + J to journal anytime." : "Press Ctrl + Shift + J to journal anytime.";
  onboardingMessage = message;
  if (Notification.isSupported()) {
    new Notification({ title: "Glass Journal Overlay", body: message }).show();
  }
  fs.writeFileSync(settingsPath, JSON.stringify({ onboardingSeen: true }));
};

const registerIpc = () => {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("save-entry", async (_event, text: string) => {
    const trimmed = (text ?? "").toString().trim();
    if (!trimmed) return null;
    return storage.saveEntry(trimmed);
  });
  ipcMain.handle("list-entries", async (_event, payload: { limit?: number; offset?: number }) => {
    const { limit = 20, offset = 0 } = payload || {};
    return storage.listEntries(limit, offset);
  });
  ipcMain.on("hide-overlay", () => hideOverlay());
  ipcMain.on("nudge-overlay", (_event, payload: { dx: number; dy: number }) => {
    const { dx = 0, dy = 0 } = payload || {};
    nudgeOverlay(dx, dy);
  });
};

const registerNudgeShortcuts = () => {
  unregisterNudgeShortcuts();
  nudgeAccelerators.forEach(({ accelerator, dx, dy }) => {
    globalShortcut.register(accelerator, () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        nudgeOverlay(dx, dy);
      }
    });
  });
};

const unregisterNudgeShortcuts = () => {
  nudgeAccelerators.forEach(({ accelerator }) => globalShortcut.unregister(accelerator));
};

app.whenReady().then(() => {
  app.setAppUserModelId("com.quillio.glassjournal");
  if (isMac && app.dock) app.dock.hide();

  createOverlayWindow();
  createTray();
  Menu.setApplicationMenu(null);
  setShortcut();
  registerIpc();
  sendOnboardingToast();

  app.on("activate", () => {
    if (!overlayWindow) createOverlayWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});
