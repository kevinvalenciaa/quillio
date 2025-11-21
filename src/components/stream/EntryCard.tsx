import { JournalEntry } from '@/types/journal';
import { format } from 'date-fns';
import { MoreHorizontal, ArrowRight, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EntryCardProps {
  entry: JournalEntry;
  onMoveToCanvas?: (id: string) => void;
}

export const EntryCard = ({ entry, onMoveToCanvas }: EntryCardProps) => {
  const isAI = entry.type === 'ai' || entry.type === 'suggestion';

  return (
    <div className={cn("group relative mb-4 flex gap-4 transition-all hover:translate-x-1", isAI ? "ml-8" : "")}>
      <div className="flex flex-col items-center pt-1">
         <div className={cn("h-2 w-2 rounded-full", isAI ? "bg-blue-500" : "bg-white/20 group-hover:bg-white/40")} />
         <div className="h-full w-px bg-white/5 group-hover:bg-white/10 -mb-4" />
      </div>
      
      <div className={cn(
          "flex-1 rounded-xl border p-4 transition-all",
          isAI 
            ? "bg-blue-500/5 border-blue-500/20" 
            : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8"
      )}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/40">
              {format(entry.timestamp, 'h:mm a')}
            </span>
            {entry.tags?.map(tag => (
                <span key={tag} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
                    #{tag}
                </span>
            ))}
          </div>
          
          {!isAI && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-3 w-3 text-white/60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                    <DropdownMenuItem onClick={() => onMoveToCanvas?.(entry.id)} className="text-white/80 focus:text-white focus:bg-white/10 cursor-pointer">
                        <ArrowRight className="mr-2 h-3 w-3" /> Move to Canvas
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
          {entry.content}
        </div>

        {isAI && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-400/80">
                <Sparkles className="h-3 w-3" />
                <span>Reflection Prompt</span>
            </div>
        )}
      </div>
    </div>
  );
};

