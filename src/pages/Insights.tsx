import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Users, Zap, Calendar } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JournalEntry } from '@/types/journal';
import { format, subDays } from 'date-fns';

const Insights = () => {
  const navigate = useNavigate();
  const [entries] = useLocalStorage<JournalEntry[]>('quillio-entries', []);

  // Mock pattern detection
  const patterns = [
    { topic: 'work', mentions: 12, trend: 'up' },
    { topic: 'exercise', mentions: 5, trend: 'down' },
    { topic: 'consulting', mentions: 8, trend: 'up' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Insights</h1>
          <p className="text-muted-foreground">What I'm seeing about you</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Journeys */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Journeys</h2>
          </div>
          <div className="space-y-3">
            <Card className="p-5 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium">Work → Consulting</h3>
                  <p className="text-sm text-muted-foreground">8 weeks journey</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                From "I hate my job" to planning independence
              </div>
            </Card>

            <Card className="p-5 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium">Exercise routine</h3>
                  <p className="text-sm text-muted-foreground">3 weeks</p>
                </div>
                <Badge variant="outline">Stalled</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Started strong, mentions dropping off
              </div>
            </Card>
          </div>
        </section>

        {/* Patterns */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Patterns This Week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {patterns.map((pattern) => (
              <Card key={pattern.topic} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">#{pattern.topic}</span>
                  <TrendingUp className={`h-4 w-4 ${pattern.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className="text-2xl font-bold">{pattern.mentions}</p>
                <p className="text-xs text-muted-foreground">mentions</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Triggers */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Triggers</h2>
          </div>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-3">
              You tend to feel stressed on:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Mondays</Badge>
              <Badge variant="secondary">After team meetings</Badge>
              <Badge variant="secondary">Late evenings</Badge>
            </div>
          </Card>
        </section>

        {/* Activity Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Activity</h2>
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{entries.length}</p>
                <p className="text-sm text-muted-foreground">Total entries</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {entries.filter(e => e.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                </p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Insights;
