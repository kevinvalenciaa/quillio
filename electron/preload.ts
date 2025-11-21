import { contextBridge, ipcRenderer } from "electron";
import type { JournalEntry } from "./storage";

type OverlayCallback = () => void;

const ipc = {
  saveEntry: (text: string) => ipcRenderer.invoke("save-entry", text) as Promise<JournalEntry | null>,
  listEntries: (limit?: number, offset?: number) => ipcRenderer.invoke("list-entries", { limit, offset }) as Promise<JournalEntry[]>,
  ping: () => ipcRenderer.invoke("ping") as Promise<string>,
  hideOverlay: () => ipcRenderer.send("hide-overlay"),
  nudgeOverlay: (dx: number, dy: number) => ipcRenderer.send("nudge-overlay", { dx, dy }),
  onOverlayVisible: (callback: OverlayCallback) => {
    const listener = () => callback();
    ipcRenderer.on("overlay-visible", listener);
    return () => ipcRenderer.removeListener("overlay-visible", listener);
  },
  onOverlayHidden: (callback: OverlayCallback) => {
    const listener = () => callback();
    ipcRenderer.on("overlay-hidden", listener);
    return () => ipcRenderer.removeListener("overlay-hidden", listener);
  },
  onOnboarding: (callback: (message: string) => void) => {
    const listener = (_event: unknown, message: string) => callback(message);
    ipcRenderer.on("onboarding", listener);
    return () => ipcRenderer.removeListener("onboarding", listener);
  },
};

contextBridge.exposeInMainWorld("api", ipc);
