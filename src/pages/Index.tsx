import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JournalEntry, AIConfig } from '@/types/journal';
import { getAIResponse } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { TimelineHeader } from '@/components/stream/TimelineHeader';
import { QuickCaptureComposer } from '@/components/stream/QuickCaptureComposer';
import { EntryCard } from '@/components/stream/EntryCard';
import { AIInlinePrompt } from '@/components/stream/AIInlinePrompt';
import { AISuggestionCard } from '@/components/stream/AISuggestionCard'; // Keep this for big suggestions

const Index = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('quillio-entries', []);
  const [aiConfig] = useLocalStorage<AIConfig>('quillio-ai-config', {
    apiKey: '',
    enabled: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showCanvasSuggestion, setShowCanvasSuggestion] = useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on load/new entry
  useEffect(() => {
    if (bottomRef.current) {
        // Use a small timeout to ensure render
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }, [entries.length]);

  // Mock pattern detection for Canvas suggestion
  useEffect(() => {
    const workMentions = entries.filter(e => 
      e.content.toLowerCase().includes('work') || 
      e.content.toLowerCase().includes('job') ||
      e.content.toLowerCase().includes('consulting')
    );
    
    if (workMentions.length >= 3 && !showCanvasSuggestion) {
      const timer = setTimeout(() => setShowCanvasSuggestion(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [entries]);

  const handleCapture = async (content: string, type: 'text' | 'voice' | 'image') => {
    setIsSaving(true);
    
    // Simple tag detection
    const tags: string[] = [];
    if (content.toLowerCase().includes('work') || content.toLowerCase().includes('job')) tags.push('work');
    if (content.toLowerCase().includes('exercise') || content.toLowerCase().includes('gym')) tags.push('health');
    if (content.toLowerCase().includes('consult')) tags.push('consulting');

    const userEntry: JournalEntry = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      type: 'user',
      tags: tags.length > 0 ? tags : undefined,
    };

    setEntries(prev => [...prev, userEntry]);

    // AI Response
    if (aiConfig.enabled && aiConfig.apiKey) {
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
          description: 'Failed to get response.',
          variant: 'destructive',
        });
      }
    }
    
    setIsSaving(false);
  };

  const handleMoveToCanvas = (id: string) => {
    toast({ title: "Moved to Canvas", description: "This entry is now available in your workspace." });
    // Logic to add to canvas context would go here
  };

  // Filter for today's count
  const todayCount = entries.filter(e => {
      const d = new Date(e.timestamp);
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className="h-full overflow-y-auto px-4 py-8 scrollbar-hide">
      <div className="mx-auto max-w-2xl pb-20">
        <TimelineHeader count={todayCount} />
        
        <QuickCaptureComposer onSubmit={handleCapture} isSaving={isSaving} />

        <div className="space-y-6">
            {entries.length === 0 && (
                <div className="py-12 text-center text-white/40">
                    <p>Your stream is empty. Capture a thought to begin.</p>
                </div>
            )}

            {entries.map((entry, i) => (
                <div key={entry.id}>
                    <EntryCard entry={entry} onMoveToCanvas={handleMoveToCanvas} />
                    
                    {/* Mock AI Inline Prompt after specific conditions (just for demo) */}
                    {i === entries.length - 1 && entry.tags?.includes('consulting') && (
                        <AIInlinePrompt 
                            context="Recurring Theme: Career"
                            message="You've mentioned consulting 3 times this week. Are you considering a switch?"
                            onDismiss={() => {}}
                        />
                    )}
                </div>
            ))}
            
            {showCanvasSuggestion && (
                 <AISuggestionCard
                    title="This looks bigger than a daily note"
                    description="You've mentioned work and career decisions multiple times. Want to map it out on a canvas?"
                    onAccept={() => navigate('/canvas')}
                    onDismiss={() => setShowCanvasSuggestion(false)}
                 />
            )}
            
            <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default Index;
