import type { JournalEntry } from "../../electron/storage";

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
      saveEntry: (text: string) => Promise<JournalEntry | null>;
      listEntries: (limit?: number, offset?: number) => Promise<JournalEntry[]>;
      hideOverlay: () => void;
      nudgeOverlay: (dx: number, dy: number) => void;
      onOverlayVisible: (callback: () => void) => () => void;
      onOverlayHidden: (callback: () => void) => () => void;
      onOnboarding: (callback: (message: string) => void) => () => void;
    };
  }
}

export {};
