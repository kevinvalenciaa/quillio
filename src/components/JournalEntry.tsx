import { JournalEntry as JournalEntryType } from '@/types/journal';
import { format } from 'date-fns';

interface JournalEntryProps {
  entry: JournalEntryType;
}

export function JournalEntry({ entry }: JournalEntryProps) {
  const isAI = entry.type === 'ai';
  
  return (
    <div className={`mb-6 ${isAI ? 'ml-8' : 'mr-8'}`}>
      <div className={`rounded-2xl p-5 ${
        isAI 
          ? 'bg-accent/10 border border-accent/20' 
          : 'bg-card border border-border'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${
            isAI ? 'text-accent' : 'text-muted-foreground'
          }`}>
            {isAI ? 'Quillio' : 'You'}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(entry.timestamp, 'h:mm a')}
          </span>
        </div>
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
          {entry.content}
        </p>
      </div>
    </div>
  );
}
