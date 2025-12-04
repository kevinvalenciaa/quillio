import { useState } from "react";
import { Mic, PenTool, StopCircle, Trash2, Clock, Calendar, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useVoiceRecorder, formatRecordingTime } from "@/hooks/useVoiceRecorder";
import { useAppData } from "@/context/AppDataContext";
import { useToast } from "@/hooks/use-toast";

export default function DailyCapture() {
  const [mode, setMode] = useState<'initial' | 'voice' | 'text' | 'review'>('initial');
  const [textInput, setTextInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { addCapture, todayCaptures, founderContext } = useAppData();
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    transcript,
    isTranscribing,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    transcribe,
  } = useVoiceRecorder();

  // Start voice recording
  const handleStartVoice = async () => {
    setMode('voice');
    await startRecording();
  };

  // Stop and transcribe
  const handleStopRecording = async () => {
    await stopRecording();
    setMode('review');
    
    // Auto-transcribe after stopping
    const result = await transcribe();
    if (!result) {
      toast({
        title: "Transcription failed",
        description: recorderError || "Could not transcribe audio. You can still save the recording.",
        variant: "destructive",
      });
    }
  };

  // Discard recording
  const handleDiscard = () => {
    reset();
    setMode('initial');
  };

  // Save voice capture
  const handleSaveVoice = async () => {
    if (!transcript && !audioBlob) {
      toast({
        title: "Nothing to save",
        description: "Please record something first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const content = transcript || "[Voice recording - transcription pending]";
      const capture = await addCapture(content, 'voice');
      
      if (capture) {
        toast({
          title: "Capture saved!",
          description: "Your voice note has been captured.",
        });
        reset();
        setMode('initial');
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({
        title: "Error saving capture",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save text capture
  const handleSaveText = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Nothing to save",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const capture = await addCapture(textInput.trim(), 'text');
      
      if (capture) {
        toast({
          title: "Capture saved!",
          description: "Your thought has been captured.",
        });
        setTextInput("");
        setMode('initial');
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({
        title: "Error saving capture",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#0F1729] text-white relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-serif text-white mb-1">Today's Capture</h1>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {format(new Date(), "EEEE, MMMM do")}
              </span>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {format(new Date(), "h:mm a")}
              </span>
            </div>
          </div>
        </header>

        {/* Capture Area */}
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {/* Initial State */}
          {mode === 'initial' && (
            <div className="bg-[#1F2D47]/40 border border-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-[#1F2D47]/50">
              <h2 className="text-2xl font-medium mb-2 font-serif">What's on your mind?</h2>
              <p className="text-gray-400 mb-8">Voice or text - whatever works right now</p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  onClick={handleStartVoice}
                  className="h-16 w-48 bg-accent hover:bg-accent/90 text-white rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-accent/20 border-0"
                >
                  <Mic className="h-5 w-5" />
                  <span className="text-sm font-medium">Voice Note</span>
                </Button>
                <Button 
                  onClick={() => setMode('text')}
                  className="h-16 w-48 bg-[#1F2D47] hover:bg-[#2a3b5b] text-white border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-black/20"
                >
                  <PenTool className="h-5 w-5" />
                  <span className="text-sm font-medium">Type</span>
                </Button>
              </div>
            </div>
          )}

          {/* Text Mode */}
          {mode === 'text' && (
            <div className="bg-[#1F2D47]/60 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Textarea 
                placeholder="What's the decision or challenge you're thinking about? What context matters?"
                className="min-h-[200px] bg-transparent border-none text-lg resize-none focus-visible:ring-0 p-0 placeholder:text-gray-500/50 text-gray-100 leading-relaxed"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                autoFocus
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">{textInput.length}/2000</span>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => { setTextInput(""); setMode('initial'); }}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveText}
                    className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20"
                    disabled={isSaving || !textInput.trim()}
                  >
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                    ) : (
                      "Save Capture"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Voice Recording Mode */}
          {mode === 'voice' && (
            <div className="bg-[#1F2D47]/90 border border-accent/30 rounded-2xl p-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden shadow-2xl shadow-accent/10">
              {/* Pulse effect */}
              {isRecording && !isPaused && (
                <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />
              )}
              
              {/* Timer */}
              <div className="mb-6 font-mono text-4xl font-medium text-white tabular-nums tracking-widest">
                {formatRecordingTime(recordingTime)}
              </div>
              
              {/* Waveform visualization */}
              <div className="flex items-center gap-1 h-16 mb-8 w-full justify-center px-12 max-w-md">
                {[...Array(40)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-accent rounded-full transition-all duration-150"
                    style={{ 
                      height: isRecording && !isPaused ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                      opacity: isRecording && !isPaused ? 0.8 : 0.2
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6 z-10">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleDiscard}
                  className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                
                <Button 
                  size="icon"
                  onClick={handleStopRecording}
                  className="h-16 w-16 rounded-full bg-accent hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 border-4 border-[#1F2D47]"
                >
                  <StopCircle className="h-8 w-8 fill-current" />
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-400 font-medium tracking-wide">
                {isPaused ? 'PAUSED' : 'RECORDING...'}
              </div>
              
              {recorderError && (
                <div className="mt-4 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {recorderError}
                </div>
              )}
            </div>
          )}

          {/* Review Mode (after recording) */}
          {mode === 'review' && (
            <div className="bg-[#1F2D47]/60 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Mic className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm text-gray-400">
                  Voice recording • {formatRecordingTime(recordingTime)}
                </span>
              </div>
              
              {isTranscribing ? (
                <div className="flex items-center gap-3 py-8 justify-center text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Transcribing your recording...</span>
                </div>
              ) : transcript ? (
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Transcription
                  </div>
                  <p className="text-gray-200 leading-relaxed">{transcript}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-4 text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>Transcription not available. Recording will be saved for processing.</span>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  onClick={handleDiscard}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button 
                  onClick={handleSaveVoice}
                  className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                  ) : (
                    "Save Capture"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Recent Captures */}
          <div className="pt-8 border-t border-white/5">
            <h3 className="text-lg font-serif font-medium mb-6 text-white">
              Today's Captures {todayCaptures.length > 0 && `(${todayCaptures.length})`}
            </h3>
            <div className="grid gap-4">
              {todayCaptures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No captures yet today. Start capturing your thoughts!
                </div>
              ) : (
                todayCaptures.map((capture) => (
                  <CaptureCard 
                    key={capture.id}
                    time={format(new Date(capture.timestamp), "h:mm a")}
                    preview={capture.content.slice(0, 100) + (capture.content.length > 100 ? "..." : "")}
                    type={capture.source}
                    category={capture.category}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Context */}
      <div className="w-[240px] border-l border-white/5 hidden xl:block bg-[#0F1729]/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Context</h3>
        </div>
        <div className="space-y-6">
          <ContextItem 
            label="Runway" 
            value={`${founderContext.runway} days`} 
            highlight={founderContext.runway < 90} 
          />
          <ContextItem 
            label="Burn Rate" 
            value={`$${founderContext.monthlyBurnRate.toLocaleString()}/mo`} 
          />
          <ContextItem 
            label="Growth" 
            value={`${founderContext.weeklyGrowthRate}% weekly`} 
          />
          <ContextItem 
            label="Revenue" 
            value={`$${founderContext.monthlyRevenue.toLocaleString()} MRR`} 
          />
          
          <div className="pt-6 mt-6 border-t border-white/10">
            <div className="text-[10px] text-gray-600 uppercase mb-2 font-bold tracking-wider">Last Updated</div>
            <div className="text-xs text-gray-500">
              {format(new Date(founderContext.lastUpdated), "MMM d, h:mm a")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CaptureCardProps {
  time: string;
  preview: string;
  type: string;
  category?: string;
}

const CaptureCard = ({ time, preview, type, category }: CaptureCardProps) => (
  <div className="bg-[#1F2D47]/40 border border-white/5 hover:bg-[#1F2D47]/60 transition-all duration-200 p-4 rounded-lg flex items-center gap-4 cursor-pointer group">
    <div className="text-xs text-gray-500 font-mono w-16">{time}</div>
    <div className="flex-1 text-sm text-gray-300 truncate group-hover:text-white transition-colors">
      {preview}
    </div>
    {category && category !== 'uncategorized' && (
      <div className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500 capitalize">
        {category}
      </div>
    )}
    <div className="text-gray-600 group-hover:text-accent transition-colors">
      {type === 'voice' ? <Mic className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
    </div>
  </div>
);

interface ContextItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const ContextItem = ({ label, value, highlight }: ContextItemProps) => (
  <div className="group cursor-pointer">
    <div className="text-xs text-gray-500 mb-1 group-hover:text-gray-400 transition-colors">{label}</div>
    <div className={`font-medium text-base ${highlight ? 'text-accent' : 'text-white group-hover:text-gray-200'}`}>
      {value}
    </div>
  </div>
);
