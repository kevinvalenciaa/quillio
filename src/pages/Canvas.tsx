import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Brain, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const Canvas = () => {
  const navigate = useNavigate();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div className="flex h-full bg-background">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-semibold">New Canvas</h1>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAIPanel(!showAIPanel)}>
              <Brain className="h-4 w-4 mr-2" />
              Analyze
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 min-h-[600px]">
              <Textarea
                placeholder="Start writing your thoughts here... (Full canvas with drawing tools coming soon)"
                className="min-h-[500px] text-lg resize-none border-none focus-visible:ring-0"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAIPanel && (
        <div className="w-96 border-l border-border bg-card p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">AI Analysis</h2>
          
          {notes.length > 20 ? (
            <div className="space-y-4">
              <Card className="p-4 bg-accent/10">
                <h3 className="font-medium mb-2 text-sm">Central Question</h3>
                <p className="text-sm text-muted-foreground">
                  What's the main decision you're working through?
                </p>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-2 text-sm">What I see</h3>
                <p className="text-sm text-muted-foreground">
                  Start organizing your thoughts into clusters—what are the constraints, options, and timelines?
                </p>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-2 text-sm">Suggested Focus</h3>
                <p className="text-sm text-muted-foreground">
                  What's the first question we should answer?
                </p>
              </Card>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Start writing to get AI insights</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Canvas;
