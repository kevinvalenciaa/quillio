// electron/preload.ts
var import_electron = require("electron");
var ipc = {
  saveEntry: (text) => import_electron.ipcRenderer.invoke("save-entry", text),
  listEntries: (limit, offset) => import_electron.ipcRenderer.invoke("list-entries", { limit, offset }),
  ping: () => import_electron.ipcRenderer.invoke("ping"),
  hideOverlay: () => import_electron.ipcRenderer.send("hide-overlay"),
  nudgeOverlay: (dx, dy) => import_electron.ipcRenderer.send("nudge-overlay", { dx, dy }),
  onOverlayVisible: (callback) => {
    const listener = () => callback();
    import_electron.ipcRenderer.on("overlay-visible", listener);
    return () => import_electron.ipcRenderer.removeListener("overlay-visible", listener);
  },
  onOverlayHidden: (callback) => {
    const listener = () => callback();
    import_electron.ipcRenderer.on("overlay-hidden", listener);
    return () => import_electron.ipcRenderer.removeListener("overlay-hidden", listener);
  },
  onOnboarding: (callback) => {
    const listener = (_event, message) => callback(message);
    import_electron.ipcRenderer.on("onboarding", listener);
    return () => import_electron.ipcRenderer.removeListener("onboarding", listener);
  }
};
import_electron.contextBridge.exposeInMainWorld("api", ipc);
