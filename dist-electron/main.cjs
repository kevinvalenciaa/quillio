var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_node_path2 = __toESM(require("path"), 1);
var import_node_fs2 = __toESM(require("fs"), 1);
var import_electron = require("electron");

// electron/storage.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_node_crypto = require("crypto");
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var SQLiteStorage = class {
  constructor(dbPath) {
    this.dbPath = dbPath;
    import_node_fs.default.mkdirSync(import_node_path.default.dirname(dbPath), { recursive: true });
    this.db = new import_better_sqlite3.default(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.prepare(
      `
        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER
        )
      `
    ).run();
    this.insertStmt = this.db.prepare(
      "INSERT INTO entries (id, text, createdAt, updatedAt) VALUES (@id, @text, @createdAt, @updatedAt)"
    );
    this.listStmt = this.db.prepare("SELECT id, text, createdAt, updatedAt FROM entries ORDER BY createdAt DESC LIMIT ? OFFSET ?");
  }
  db;
  insertStmt;
  listStmt;
  async saveEntry(text) {
    const entry = {
      id: (0, import_node_crypto.randomUUID)(),
      text,
      createdAt: Date.now(),
      updatedAt: null
    };
    this.insertStmt.run(entry);
    return entry;
  }
  async listEntries(limit = 20, offset = 0) {
    return this.listStmt.all(limit, offset);
  }
};
var JsonStorage = class {
  constructor(filePath) {
    this.filePath = filePath;
    import_node_fs.default.mkdirSync(import_node_path.default.dirname(filePath), { recursive: true });
    this.tempPath = `${filePath}.tmp`;
    if (import_node_fs.default.existsSync(filePath)) {
      try {
        const contents = import_node_fs.default.readFileSync(filePath, "utf8");
        this.cache = JSON.parse(contents);
      } catch {
        this.cache = [];
      }
    }
  }
  cache = [];
  tempPath;
  async saveEntry(text) {
    const entry = { id: (0, import_node_crypto.randomUUID)(), text, createdAt: Date.now() };
    this.cache.unshift(entry);
    await this.write();
    return entry;
  }
  async listEntries(limit = 20, offset = 0) {
    return this.cache.slice(offset, offset + limit);
  }
  async write() {
    const payload = JSON.stringify(this.cache);
    await import_node_fs.default.promises.writeFile(this.tempPath, payload, "utf8");
    await import_node_fs.default.promises.rename(this.tempPath, this.filePath);
  }
};
var createStorage = (basePath) => {
  const sqlitePath = import_node_path.default.join(basePath, "journal.db");
  try {
    return new SQLiteStorage(sqlitePath);
  } catch (error) {
    console.warn(`[storage] Falling back to JSON due to: ${String(error?.message ?? error)}`);
    const jsonPath = import_node_path.default.join(basePath, "journal.json");
    return new JsonStorage(jsonPath);
  }
};

// electron/main.ts
var overlaySize = { width: 420, height: 280 };
var isMac = process.platform === "darwin";
var overlayWindow = null;
var tray = null;
var hideTimer = null;
var onboardingMessage = null;
var suppressHideUntil = 0;
var nudgeAccelerators = [
  { accelerator: "CommandOrControl+Left", dx: -8, dy: 0 },
  { accelerator: "CommandOrControl+Right", dx: 8, dy: 0 },
  { accelerator: "CommandOrControl+Up", dx: 0, dy: -8 },
  { accelerator: "CommandOrControl+Down", dx: 0, dy: 8 },
  { accelerator: "CommandOrControl+Shift+Left", dx: -14, dy: 0 },
  { accelerator: "CommandOrControl+Shift+Right", dx: 14, dy: 0 },
  { accelerator: "CommandOrControl+Shift+Up", dx: 0, dy: -14 },
  { accelerator: "CommandOrControl+Shift+Down", dx: 0, dy: 14 }
];
var storage = createStorage(import_electron.app.getPath("userData"));
var hasInstanceLock = import_electron.app.requestSingleInstanceLock();
if (!hasInstanceLock) {
  import_electron.app.quit();
  process.exit(0);
}
import_electron.app.on("second-instance", () => {
  showOverlay();
});
var rendererUrl = process.env.VITE_DEV_SERVER_URL ?? `file://${import_node_path2.default.join(__dirname, "../dist/index.html")}`;
var preloadPath = import_node_path2.default.join(__dirname, "preload.cjs");
var setShortcut = () => {
  const shortcut = isMac ? "Command+Shift+J" : "Control+Shift+J";
  const ok = import_electron.globalShortcut.register(shortcut, () => toggleOverlay());
  if (!ok) {
    console.warn("[overlay] Failed to register global shortcut");
  }
};
var getOverlayPosition = () => {
  const cursor = import_electron.screen.getCursorScreenPoint();
  const display = import_electron.screen.getDisplayNearestPoint(cursor);
  const { x, y, width, height } = display.workArea;
  const clampedX = Math.min(Math.max(cursor.x - overlaySize.width / 2, x), x + width - overlaySize.width);
  const clampedY = Math.min(Math.max(cursor.y - overlaySize.height / 2, y), y + height - overlaySize.height);
  if (Number.isFinite(clampedX) && Number.isFinite(clampedY)) {
    return { x: Math.round(clampedX), y: Math.round(clampedY) };
  }
  return {
    x: Math.round(x + width / 2 - overlaySize.width / 2),
    y: Math.round(y + height / 2 - overlaySize.height / 2)
  };
};
var createOverlayWindow = () => {
  overlayWindow = new import_electron.BrowserWindow({
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
      nodeIntegration: false
    }
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
var showOverlay = () => {
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
var hideOverlay = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (!overlayWindow) return;
  overlayWindow.hide();
  overlayWindow.webContents.send("overlay-hidden");
  unregisterNudgeShortcuts();
};
var nudgeOverlay = (deltaX, deltaY) => {
  if (!overlayWindow) return;
  const bounds = overlayWindow.getBounds();
  const display = import_electron.screen.getDisplayMatching(bounds);
  const { x, y, width, height } = display.workArea;
  const next = {
    x: Math.min(Math.max(bounds.x + deltaX, x), x + width - bounds.width),
    y: Math.min(Math.max(bounds.y + deltaY, y), y + height - bounds.height)
  };
  overlayWindow.setBounds({ ...bounds, ...next });
  suppressHideUntil = Date.now() + 800;
  overlayWindow.focus();
  overlayWindow.webContents.focus();
};
var toggleOverlay = () => {
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
var createTray = () => {
  const trayImage = import_electron.nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABOlBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8Vah/9AAAAUHRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlteX2BhYnN4IAoAAADuSURBVFjD7dTZUsIwEIDh3aRAEOIlBDCUqVSpWv3/W5SQYDEzM/PzPZkzNEIFxXb7HP35bLE8QAIvVLD9Jqlettbdx5CmwzPXLtLySdV3+YyFSLJTpORIUVkBRCYkVyXJoViay3hV5GOQayUv+SBAkB6LG2F2d9hCkDM7JNDd2iuNW074BnLfCgL6D6TS+86SbaZFAiKc36q5w0dGiupcFJM4oeKZAzh9wWzuM7hB5TtqDobGO4MR0M+Mgj1QLLcznd4wz2e2GRrbnO+mQmIEotUtV+IDXLiIDd2vAg+OFQE9o/Sg0VqVWtrnZwUTMDrazNRYoeCPeXprrh24NHUZ4A8MVDdKgr+vMmcVuXfV0RLlR4gqXbtzSc+PumN++kXibSu66F/wDNA/SUZlr3zQAAAABJRU5ErkJggg=="
  );
  trayImage.setTemplateImage(true);
  tray = new import_electron.Tray(trayImage);
  const menu = import_electron.Menu.buildFromTemplate([
    {
      label: "Open Journal",
      click: () => showOverlay()
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        import_electron.app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip("Glass Journal Overlay");
  tray.on("click", () => toggleOverlay());
};
var sendOnboardingToast = () => {
  const settingsPath = import_node_path2.default.join(import_electron.app.getPath("userData"), "settings.json");
  let shouldShow = true;
  if (import_node_fs2.default.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(import_node_fs2.default.readFileSync(settingsPath, "utf8"));
      shouldShow = !settings.onboardingSeen;
    } catch {
      shouldShow = true;
    }
  }
  if (!shouldShow) return;
  const message = isMac ? "Press Cmd + Shift + J to journal anytime." : "Press Ctrl + Shift + J to journal anytime.";
  onboardingMessage = message;
  if (import_electron.Notification.isSupported()) {
    new import_electron.Notification({ title: "Glass Journal Overlay", body: message }).show();
  }
  import_node_fs2.default.writeFileSync(settingsPath, JSON.stringify({ onboardingSeen: true }));
};
var registerIpc = () => {
  import_electron.ipcMain.handle("ping", () => "pong");
  import_electron.ipcMain.handle("save-entry", async (_event, text) => {
    const trimmed = (text ?? "").toString().trim();
    if (!trimmed) return null;
    return storage.saveEntry(trimmed);
  });
  import_electron.ipcMain.handle("list-entries", async (_event, payload) => {
    const { limit = 20, offset = 0 } = payload || {};
    return storage.listEntries(limit, offset);
  });
  import_electron.ipcMain.on("hide-overlay", () => hideOverlay());
  import_electron.ipcMain.on("nudge-overlay", (_event, payload) => {
    const { dx = 0, dy = 0 } = payload || {};
    nudgeOverlay(dx, dy);
  });
};
var registerNudgeShortcuts = () => {
  unregisterNudgeShortcuts();
  nudgeAccelerators.forEach(({ accelerator, dx, dy }) => {
    import_electron.globalShortcut.register(accelerator, () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        nudgeOverlay(dx, dy);
      }
    });
  });
};
var unregisterNudgeShortcuts = () => {
  nudgeAccelerators.forEach(({ accelerator }) => import_electron.globalShortcut.unregister(accelerator));
};
import_electron.app.whenReady().then(() => {
  import_electron.app.setAppUserModelId("com.quillio.glassjournal");
  if (isMac && import_electron.app.dock) import_electron.app.dock.hide();
  createOverlayWindow();
  createTray();
  import_electron.Menu.setApplicationMenu(null);
  setShortcut();
  registerIpc();
  sendOnboardingToast();
  import_electron.app.on("activate", () => {
    if (!overlayWindow) createOverlayWindow();
  });
});
import_electron.app.on("will-quit", () => {
  import_electron.globalShortcut.unregisterAll();
});
import_electron.app.on("window-all-closed", (event) => {
  event.preventDefault();
});
