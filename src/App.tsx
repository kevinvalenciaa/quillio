import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

const App = () => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(() => new Date());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(timestamp),
    [timestamp],
  );

  useEffect(() => {
    const offShow = window.api.onOverlayVisible(() => {
      setTimestamp(new Date());
      setVisible(true);
      setTimeout(() => textareaRef.current?.focus(), 40);
    });
    const offHide = window.api.onOverlayHidden(() => {
      setVisible(false);
      setText("");
      setIsSaving(false);
      setPulse(false);
      setToast(null);
    });
    const offOnboarding = window.api.onOnboarding((message) => {
      setToast(message);
      setTimeout(() => setToast(null), 4600);
    });

    return () => {
      offShow();
      offHide();
      offOnboarding();
    };
  }, []);

  const handleCancel = useCallback(() => {
    setText("");
    window.api.hideOverlay();
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
        return;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleCancel]);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setToast("Write something first.");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    try {
      setIsSaving(true);
      await window.api.saveEntry(trimmed);
      setPulse(true);
      setTimeout(() => setPulse(false), 240);
      setText("");
      window.api.hideOverlay();
    } catch (error) {
      console.error(error);
      setToast("Unable to save entry. Try again.");
      setTimeout(() => setToast(null), 2600);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextareaKey = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="overlay-bg flex min-h-screen w-full items-center justify-center px-3 py-3">
      <div
        className={`glass-card relative w-full max-w-md rounded-2xl border border-white/8 bg-white/5 p-5 shadow-2xl backdrop-blur-3xl transition duration-150 ${
          visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 text-sm text-slate-100">
            <div className="text-lg font-semibold tracking-tight text-white">Journal</div>
            <div className="text-xs text-slate-300/80">{formattedDate}</div>
          </div>
          <button
            className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200/80 transition hover:bg-white/10 hover:text-white"
            onClick={handleCancel}
            aria-label="Close journal"
          >
            ×
          </button>
        </div>

        <div className="mt-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleTextareaKey}
            placeholder="What's on your mind?"
            className="min-h-[140px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none ring-1 ring-inset ring-white/10 transition focus:border-white/20 focus:ring-white/30"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-300/80">
          <span>{text.length} chars</span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-white/10 px-3 py-2 font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
              onClick={handleCancel}
            >
              Esc · Cancel
            </button>
            <button
              className={`rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white ${
                pulse ? "animate-pulse" : ""
              } ${isSaving ? "opacity-80" : ""}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              Enter · Save
            </button>
          </div>
        </div>

        {toast ? (
          <div className="absolute bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-medium text-white/90 shadow-lg backdrop-blur-xl">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default App;
