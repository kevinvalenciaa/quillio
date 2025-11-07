import { JournalEntry } from '@/types/journal';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface EnhancedJournalEntryProps {
  entry: JournalEntry;
  onAIReflect?: () => void;
}

export function EnhancedJournalEntry({ entry, onAIReflect }: EnhancedJournalEntryProps) {
  const isAI = entry.type === 'ai';
  
  return (
    <div className={`mb-6 ${isAI ? 'ml-8' : 'mr-8'}`}>
      <div className={`rounded-2xl p-5 ${
        isAI 
          ? 'bg-accent/10 border border-accent/20' 
          : 'bg-card border border-border'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${
              isAI ? 'text-accent' : 'text-muted-foreground'
            }`}>
              {isAI ? 'Quillio' : 'You'}
            </span>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex gap-1">
                {entry.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {format(entry.timestamp, 'h:mm a')}
          </span>
        </div>
        <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-3">
          {entry.content}
        </p>
        {!isAI && onAIReflect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAIReflect}
            className="text-xs text-muted-foreground hover:text-accent"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Reflect →
          </Button>
        )}
      </div>
    </div>
  );
}
