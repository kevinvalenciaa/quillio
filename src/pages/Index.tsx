import { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '@/components/JournalEntry';
import { JournalInput } from '@/components/JournalInput';
import { AISettingsDialog } from '@/components/AISettingsDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JournalEntry as JournalEntryType, AIConfig } from '@/types/journal';
import { getAIResponse } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const Index = () => {
  const [entries, setEntries] = useLocalStorage<JournalEntryType[]>('quillio-entries', []);
  const [aiConfig, setAIConfig] = useLocalStorage<AIConfig>('quillio-ai-config', {
    apiKey: '',
    enabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const handleSubmit = async (content: string) => {
    const userEntry: JournalEntryType = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      type: 'user',
    };

    setEntries([...entries, userEntry]);

    if (aiConfig.enabled && aiConfig.apiKey) {
      setIsLoading(true);
      try {
        const aiResponse = await getAIResponse(aiConfig.apiKey, [...entries, userEntry], content);
        
        const aiEntry: JournalEntryType = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          timestamp: Date.now() + 1,
          type: 'ai',
        };

        setEntries(prev => [...prev, aiEntry]);
      } catch (error) {
        toast({
          title: 'AI Error',
          description: 'Failed to get AI response. Check your API key in settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Quillio
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <AISettingsDialog config={aiConfig} onSave={setAIConfig} />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Your journey starts here</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Share what's on your mind. I'm here to listen, reflect, and help you think clearly.
              </p>
              {!aiConfig.enabled && (
                <p className="text-sm text-accent mt-4">
                  💡 Add your OpenAI API key in settings to enable AI conversations
                </p>
              )}
            </div>
          ) : (
            entries.map(entry => <JournalEntry key={entry.id} entry={entry} />)
          )}
        </div>
      </div>

      <JournalInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default Index;
