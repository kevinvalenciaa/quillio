import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, X } from 'lucide-react';

interface AISuggestionCardProps {
  title: string;
  description: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function AISuggestionCard({ title, description, onAccept, onDismiss }: AISuggestionCardProps) {
  return (
    <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 p-5 mb-6 mx-8">
      <div className="flex gap-4">
        <div className="shrink-0">
          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-accent" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1 text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAccept}>
              Open canvas
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Later
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
