import { useState, useEffect, useRef } from "react";
import { Mic, PenTool, X, StopCircle, Sparkles, Zap, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuickCaptureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (content: string, type: 'voice' | 'text') => Promise<any>;
}

export function QuickCaptureOverlay({ isOpen, onClose, onCapture }: QuickCaptureOverlayProps) {
  const [mode, setMode] = useState<'select' | 'text' | 'voice'>('select');
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Focus textarea when in text mode
  useEffect(() => {
    if (mode === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setMode('select');
      setTextInput("");
      setIsRecording(false);
      setRecordingTime(0);
      setIsSaving(false);
    }
  }, [isOpen]);

  // Keyboard shortcut to close (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Submit on Cmd+Enter in text mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && mode === 'text' && textInput.trim() && !isSaving) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, textInput, onClose, isSaving]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!textInput.trim() || isSaving) return;
    
    setIsSaving(true);
    console.log('QuickCapture: Submitting...', textInput.slice(0, 30));
    
    try {
      // Use 'text' as source (more compatible with database)
      const result = await onCapture(textInput.trim(), 'text');
      console.log('QuickCapture: onCapture returned:', result);
      
      if (result) {
        toast({
          title: "Captured!",
          description: "Your thought has been saved.",
        });
        onClose();
      } else {
        console.error('QuickCapture: Result was null/undefined');
        throw new Error("Failed to save - check if you're logged in");
      }
    } catch (error: any) {
      console.error('QuickCapture: Error:', error);
      toast({
        title: "Error saving capture",
        description: error?.message || "Please try again. Make sure you're logged in.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceStop = async () => {
    if (isSaving) return;
    
    setIsRecording(false);
    setIsSaving(true);
    
    try {
      // For now, save a placeholder for voice - real transcription would need the voice recorder hook
      const result = await onCapture(`[Voice capture - ${formatTime(recordingTime)}]`, 'voice');
      
      if (result) {
        toast({
          title: "Captured!",
          description: "Your voice note has been saved.",
        });
        onClose();
      } else {
        throw new Error("Failed to save - you may not be logged in");
      }
    } catch (error: any) {
      console.error('Quick voice capture error:', error);
      toast({
        title: "Error saving capture",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F1729] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Quick Capture</div>
              <div className="text-xs text-gray-500">⌘ + Shift + J</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/10" disabled={isSaving}>
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'select' && (
            <div className="text-center py-4">
              <h3 className="text-xl font-medium text-white mb-2">What's on your mind?</h3>
              <p className="text-gray-400 text-sm mb-8">Capture now, we'll process it overnight.</p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  onClick={() => { setMode('voice'); setIsRecording(true); }}
                  className="h-20 w-40 bg-accent hover:bg-accent/90 text-white rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-accent/20 border-0 transition-transform hover:scale-105"
                >
                  <Mic className="h-6 w-6" />
                  <span className="text-sm font-medium">Voice</span>
                </Button>
                <Button 
                  onClick={() => setMode('text')}
                  className="h-20 w-40 bg-[#1F2D47] hover:bg-[#2a3b5b] text-white border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-black/20 transition-transform hover:scale-105"
                >
                  <PenTool className="h-6 w-6" />
                  <span className="text-sm font-medium">Type</span>
                </Button>
              </div>
            </div>
          )}

          {mode === 'text' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Textarea 
                ref={textareaRef}
                placeholder="What's the decision or challenge you're thinking about?"
                className="min-h-[120px] bg-[#1F2D47]/60 border-white/10 text-base resize-none focus-visible:ring-accent p-4 placeholder:text-gray-500/70 text-gray-100 leading-relaxed rounded-xl"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isSaving}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{textInput.length}/2000</span>
                  <span className="text-gray-700">•</span>
                  <span>⌘ + Enter to save</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setMode('select')} 
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                    disabled={isSaving}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!textInput.trim() || isSaving}
                    className="bg-accent hover:bg-accent/90 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/20"
                  >
                    {isSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Capture</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mode === 'voice' && (
            <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="font-mono text-4xl font-medium text-white mb-8 tabular-nums tracking-widest">
                {formatTime(recordingTime)}
              </div>
              
              {/* Waveform visualization */}
              <div className="flex items-center gap-0.5 h-16 mb-8 justify-center px-12">
                {[...Array(50)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-accent rounded-full transition-all duration-75"
                    style={{ 
                      height: isRecording ? `${Math.max(8, Math.random() * 100)}%` : '8%',
                      opacity: isRecording ? 0.8 : 0.2
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => { setIsRecording(false); setMode('select'); setRecordingTime(0); }}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  size="lg"
                  onClick={handleVoiceStop}
                  disabled={isSaving}
                  className="h-14 px-8 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg shadow-accent/20 gap-2"
                >
                  {isSaving ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
                  ) : (
                    <><StopCircle className="h-5 w-5" /> Stop & Save</>
                  )}
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                {isSaving ? 'Saving...' : isRecording ? 'Recording...' : 'Ready to record'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to manage the quick capture overlay globally
export function useQuickCapture() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input fields
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      if (isTyping) return;
      
      // Cmd+Shift+J or Ctrl+Shift+J
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
