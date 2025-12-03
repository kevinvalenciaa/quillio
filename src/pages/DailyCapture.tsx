import { useState, useEffect } from "react";
import { Mic, PenTool, StopCircle, Trash2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function DailyCapture() {
  const [mode, setMode] = useState<'initial' | 'voice' | 'text'>('initial');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textInput, setTextInput] = useState("");
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(), "EEEE, MMMM do")}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(), "h:mm a")}</span>
                    </div>
                </div>
            </header>

            {/* Capture Area */}
            <div className="max-w-3xl w-full mx-auto space-y-8">
                {mode === 'initial' && (
                    <div className="bg-[#1F2D47]/40 border border-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-[#1F2D47]/50">
                        <h2 className="text-2xl font-medium mb-2 font-serif">What's on your mind?</h2>
                        <p className="text-gray-400 mb-8">Voice or text - whatever works right now</p>
                        <div className="flex items-center justify-center gap-4">
                            <Button 
                                onClick={() => { setMode('voice'); setIsRecording(true); }}
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

                {mode === 'text' && (
                    <div className="bg-[#1F2D47]/60 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <Textarea 
                            placeholder="What's the decision or challenge you're thinking about? What context matters?"
                            className="min-h-[200px] bg-transparent border-none text-lg resize-none focus-visible:ring-0 p-0 placeholder:text-gray-500/50 text-gray-100 leading-relaxed"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            autoFocus
                        />
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            <span className="text-xs text-gray-500">{textInput.length}/2000</span>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setMode('initial')} className="text-gray-400 hover:text-white hover:bg-white/5">Cancel</Button>
                                <Button className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20">Save Capture</Button>
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'voice' && (
                     <div className="bg-[#1F2D47]/90 border border-accent/30 rounded-2xl p-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden shadow-2xl shadow-accent/10">
                        {/* Pulse effect */}
                        {isRecording && <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />}
                        
                        <div className="mb-6 font-mono text-4xl font-medium text-white tabular-nums tracking-widest">
                            {formatTime(recordingTime)}
                        </div>
                        
                        {/* Fake Waveform */}
                        <div className="flex items-center gap-1 h-16 mb-8 w-full justify-center px-12 max-w-md">
                             {[...Array(40)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className="w-1 bg-accent rounded-full transition-all duration-150"
                                    style={{ 
                                        height: isRecording ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                                        opacity: isRecording ? 0.8 : 0.2
                                    }}
                                 />
                             ))}
                        </div>

                        <div className="flex items-center gap-6 z-10">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setIsRecording(false); setMode('initial'); setRecordingTime(0); }} 
                                className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                            <Button 
                                size="icon"
                                onClick={() => setIsRecording(!isRecording)}
                                className={`h-16 w-16 rounded-full ${isRecording ? 'bg-accent hover:bg-accent/90 animate-pulse' : 'bg-green-500 hover:bg-green-600'} transition-colors shadow-lg shadow-accent/20 border-4 border-[#1F2D47]`}
                            >
                                {isRecording ? <StopCircle className="h-8 w-8 fill-current" /> : <Mic className="h-8 w-8" />}
                            </Button>
                        </div>
                        <div className="mt-4 text-sm text-gray-400 font-medium tracking-wide">
                            {isRecording ? 'RECORDING...' : 'PAUSED'}
                        </div>
                     </div>
                )}

                {/* Recent Captures */}
                <div className="pt-8 border-t border-white/5">
                    <h3 className="text-lg font-serif font-medium mb-6 text-white">Today's Captures</h3>
                    <div className="grid gap-4">
                        <CaptureCard 
                            time="2:34 PM"
                            preview="Thinking about pricing model... usage-based would increase stickiness but harder to explain..."
                            type="voice"
                        />
                        <CaptureCard 
                            time="11:20 AM"
                            preview="Need to schedule the team retrospective for Friday."
                            type="text"
                        />
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
                <ContextItem label="Runway" value="45 days" highlight />
                <ContextItem label="Burn Rate" value="$8,500/mo" />
                <ContextItem label="Growth" value="3.2% weekly" />
                <ContextItem label="Revenue" value="$2,100 ARR" />
                
                <div className="pt-6 mt-6 border-t border-white/10">
                    <div className="text-[10px] text-gray-600 uppercase mb-2 font-bold tracking-wider">Last Updated</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
            </div>
        </div>
    </div>
  );
}

const CaptureCard = ({ time, preview, type }: any) => (
    <div className="bg-[#1F2D47]/40 border border-white/5 hover:bg-[#1F2D47]/60 transition-all duration-200 p-4 rounded-lg flex items-center gap-4 cursor-pointer group">
        <div className="text-xs text-gray-500 font-mono w-16">{time}</div>
        <div className="flex-1 text-sm text-gray-300 truncate group-hover:text-white transition-colors">{preview}</div>
        <div className="text-gray-600 group-hover:text-accent transition-colors">
            {type === 'voice' ? <Mic className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
        </div>
    </div>
)

const ContextItem = ({ label, value, highlight }: any) => (
    <div className="group cursor-pointer">
        <div className="text-xs text-gray-500 mb-1 group-hover:text-gray-400 transition-colors">{label}</div>
        <div className={`font-medium text-base ${highlight ? 'text-accent' : 'text-white group-hover:text-gray-200'}`}>{value}</div>
    </div>
)

