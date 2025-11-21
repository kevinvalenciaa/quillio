import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIInlinePromptProps {
  message: string;
  context?: string;
  onDismiss?: () => void;
  onReply?: () => void;
}

export const AIInlinePrompt = ({ message, context, onDismiss, onReply }: AIInlinePromptProps) => {
  return (
    <div className="mb-6 ml-6 border-l-2 border-blue-500/50 pl-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-blue-400">
        <Sparkles className="h-3 w-3" />
        <span>{context || "Pattern detected"}</span>
      </div>
      <p className="mb-3 text-sm text-white/80">{message}</p>
      <div className="flex gap-2">
        <Button 
            variant="secondary" 
            size="sm" 
            className="h-7 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
            onClick={onReply}
        >
            Reply
        </Button>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-white/40 hover:text-white"
            onClick={onDismiss}
        >
            Dismiss
        </Button>
      </div>
    </div>
  );
};

