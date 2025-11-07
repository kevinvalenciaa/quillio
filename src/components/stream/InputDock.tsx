import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenLine, Mic, Keyboard, Send, Loader2 } from 'lucide-react';
import { UserPreferences } from '@/types/journal';

interface InputDockProps {
  preferences: UserPreferences;
  onSubmit: (content: string, type: 'text' | 'voice' | 'handwriting') => void;
  isLoading: boolean;
}

export function InputDock({ preferences, onSubmit, isLoading }: InputDockProps) {
  const [mode, setMode] = useState<'text' | 'voice' | 'handwriting'>('text');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onSubmit(content, mode);
      setContent('');
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="max-w-3xl mx-auto p-4">
        {/* Mode selector */}
        <div className="flex gap-2 mb-3 justify-center">
          {preferences.inputMethods.typing && (
            <Button
              variant={mode === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('text')}
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          )}
          {preferences.inputMethods.voice && (
            <Button
              variant={mode === 'voice' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('voice')}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          {preferences.inputMethods.handwriting && (
            <Button
              variant={mode === 'handwriting' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('handwriting')}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Input area */}
        {mode === 'text' && (
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[60px] max-h-[200px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <Button type="submit" size="lg" disabled={!content.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        )}

        {mode === 'voice' && (
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? 'destructive' : 'default'}
              onClick={handleVoiceRecord}
              className="rounded-full h-16 w-16"
            >
              <Mic className="h-6 w-6" />
            </Button>
            {isRecording && (
              <p className="text-sm text-muted-foreground animate-pulse">Recording...</p>
            )}
          </div>
        )}

        {mode === 'handwriting' && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <PenLine className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Handwriting mode (coming soon)</p>
          </div>
        )}
      </div>
    </div>
  );
}
