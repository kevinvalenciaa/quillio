import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedJournalEntry } from '@/components/stream/EnhancedJournalEntry';
import { AISuggestionCard } from '@/components/stream/AISuggestionCard';
import { InputDock } from '@/components/stream/InputDock';
import { AISettingsDialog } from '@/components/AISettingsDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JournalEntry, AIConfig, UserPreferences } from '@/types/journal';
import { getAIResponse } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, TrendingUp, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('quillio-entries', []);
  const [aiConfig, setAIConfig] = useLocalStorage<AIConfig>('quillio-ai-config', {
    apiKey: '',
    enabled: false,
  });
  const [preferences] = useLocalStorage<UserPreferences>('quillio-preferences', {
    thinkingStyle: 'journal',
    inputMethods: { handwriting: false, voice: true, typing: true },
    privacyLevel: 'balanced',
    hasCompletedOnboarding: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCanvasSuggestion, setShowCanvasSuggestion] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preferences.hasCompletedOnboarding) {
      navigate('/onboarding');
    }
  }, [preferences.hasCompletedOnboarding, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  // Detect patterns for canvas suggestion
  useEffect(() => {
    const workMentions = entries.filter(e => 
      e.content.toLowerCase().includes('work') || 
      e.content.toLowerCase().includes('job') ||
      e.content.toLowerCase().includes('consulting')
    );
    
    if (workMentions.length >= 3 && !showCanvasSuggestion) {
      setTimeout(() => setShowCanvasSuggestion(true), 1000);
    }
  }, [entries]);

  const handleSubmit = async (content: string, type: 'text' | 'voice' | 'handwriting') => {
    // Simple tag detection
    const tags: string[] = [];
    if (content.toLowerCase().includes('work') || content.toLowerCase().includes('job')) tags.push('work');
    if (content.toLowerCase().includes('exercise') || content.toLowerCase().includes('workout')) tags.push('health');
    if (content.toLowerCase().includes('consult')) tags.push('consulting');

    const userEntry: JournalEntry = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      type: 'user',
      tags: tags.length > 0 ? tags : undefined,
    };

    setEntries([...entries, userEntry]);

    if (aiConfig.enabled && aiConfig.apiKey) {
      setIsLoading(true);
      try {
        const aiResponse = await getAIResponse(aiConfig.apiKey, [...entries, userEntry], content);
        
        const aiEntry: JournalEntry = {
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
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Quillio
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <div className="flex gap-2">
            <AISettingsDialog config={aiConfig} onSave={setAIConfig} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/insights')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Insights
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <>
              {entries.map(entry => (
                <EnhancedJournalEntry key={entry.id} entry={entry} />
              ))}
              
              {showCanvasSuggestion && (
                <AISuggestionCard
                  title="This looks bigger than a daily note"
                  description="You've mentioned work and career decisions multiple times. Want to map it out on a canvas to think through it more deeply?"
                  onAccept={() => navigate('/canvas')}
                  onDismiss={() => setShowCanvasSuggestion(false)}
                />
              )}
            </>
          )}
        </div>
      </div>

      <InputDock
        preferences={preferences}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
