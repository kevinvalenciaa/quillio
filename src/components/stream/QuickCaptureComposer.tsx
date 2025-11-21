import { useState } from "react";
import { Mic, Image as ImageIcon, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface QuickCaptureComposerProps {
  onSubmit: (content: string, type: 'text' | 'voice' | 'image') => void;
  isSaving?: boolean;
}

export const QuickCaptureComposer = ({ onSubmit, isSaving }: QuickCaptureComposerProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text, 'text');
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind? (Cmd+Enter to save)"
        className="min-h-[80px] w-full resize-none border-none bg-transparent p-0 text-lg text-white placeholder:text-white/40 focus-visible:ring-0"
      />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white">
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
        <Button 
            onClick={handleSubmit} 
            disabled={!text.trim() || isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
        >
            {isSaving ? 'Saving...' : <><Send className="mr-2 h-3 w-3" /> Save</>}
        </Button>
      </div>
    </div>
  );
};

