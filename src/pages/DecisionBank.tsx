import { useState } from "react";
import { Search, MoreHorizontal, Check, ChevronDown, ChevronUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppData, type Decision } from "@/context/AppDataContext";
import { format, formatDistanceToNow } from "date-fns";

export default function DecisionBank() {
  const { decisions, activeLoops, lockedDecisions, deferredDecisions, lockDecision, deferDecision, loading } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDecisions = (list: Decision[]) => {
    if (!searchQuery.trim()) return list;
    return list.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="flex h-full w-full bg-[#0F1729] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0F1729] text-white overflow-hidden flex-col">
      {/* Header */}
      <header className="px-8 pt-8 pb-6 flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">Decision Bank</h1>
          <p className="text-sm text-gray-400">Your library of locked decisions and pending loops</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search decisions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-[#1F2D47]/60 border-white/15 text-sm focus-visible:ring-accent focus-visible:border-accent/50 placeholder:text-gray-500 rounded-lg" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-[#1F2D47]/60 border-white/15 text-gray-300 hover:text-white hover:bg-white/10 h-10 px-3 gap-2">
                  Most Recent <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1F2D47] border-white/10 text-white">
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Most Recent</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Oldest First</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Most Referenced</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 border-b border-white/10 bg-[#1F2D47]">
          <TabsList className="h-auto p-0 bg-transparent space-x-8">
            <TabTrigger value="active" label={`Active Loops (${activeLoops.length})`} />
            <TabTrigger value="locked" label={`Locked (${lockedDecisions.length})`} />
            <TabTrigger value="deferred" label={`Deferred (${deferredDecisions.length})`} />
            <TabTrigger value="all" label={`All (${decisions.length})`} />
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0F1729]">
          <TabsContent value="active" className="m-0 space-y-6 max-w-4xl mx-auto">
            {filteredDecisions(activeLoops).length === 0 ? (
              <EmptyState 
                icon={Check} 
                title="No active loops right now" 
                subtitle="Keep capturing your thoughts—we'll surface decision loops when they appear." 
              />
            ) : (
              filteredDecisions(activeLoops).map((decision) => (
                <ActiveLoopCard 
                  key={decision.id}
                  decision={decision}
                  onLock={lockDecision}
                  onDefer={deferDecision}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="locked" className="m-0 space-y-6 max-w-4xl mx-auto">
            {filteredDecisions(lockedDecisions).length === 0 ? (
              <EmptyState 
                icon={Check} 
                title="No locked decisions yet" 
                subtitle="Lock decisions during your Monday ritual to track execution." 
              />
            ) : (
              filteredDecisions(lockedDecisions).map((decision) => (
                <LockedDecisionCard key={decision.id} decision={decision} />
              ))
            )}
          </TabsContent>

          <TabsContent value="deferred" className="m-0 space-y-6 max-w-4xl mx-auto">
            {filteredDecisions(deferredDecisions).length === 0 ? (
              <EmptyState 
                icon={Clock} 
                title="No deferred decisions" 
                subtitle="Defer decisions that need more time or information." 
              />
            ) : (
              filteredDecisions(deferredDecisions).map((decision) => (
                <DeferredDecisionCard key={decision.id} decision={decision} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="all" className="m-0 max-w-4xl mx-auto">
            {filteredDecisions(decisions).length === 0 ? (
              <EmptyState 
                icon={AlertCircle} 
                title="No decisions yet" 
                subtitle="Capture your thoughts and we'll help identify decision loops." 
              />
            ) : (
              <div className="relative border-l border-white/10 ml-6 space-y-4 py-4">
                {filteredDecisions(decisions).map((decision) => (
                  <TimelineItem key={decision.id} decision={decision} />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

const TabTrigger = ({ value, label }: { value: string; label: string }) => (
  <TabsTrigger 
    value={value} 
    className="px-3 py-4 text-sm font-medium text-white/60 data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_0_#C17A72] rounded-none transition-all hover:text-white/80"
  >
    {label}
  </TabsTrigger>
);

interface ActiveLoopCardProps {
  decision: Decision;
  onLock: (id: string, option: string, reasoning: string, nextStep: string) => Promise<void>;
  onDefer: (id: string, until: number) => Promise<void>;
}

const ActiveLoopCard = ({ decision, onLock, onDefer }: ActiveLoopCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleLock = () => {
    const option = decision.options[0]?.label || decision.title;
    onLock(decision.id, option, "Decided during review", "Execute this week");
  };

  const handleDefer = () => {
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    onDefer(decision.id, nextWeek);
  };

  return (
    <div className="bg-[#1F2D47]/70 border-l-[3px] border-[#D89966] rounded-[10px] p-6 mb-4 hover:bg-[#1F2D47]/85 transition-colors group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{decision.title}</h3>
        <div className="text-right">
          <Badge className="bg-[#D89966] hover:bg-[#D89966] text-white border-none text-[11px] rounded-full px-2 mb-1">Active Loop</Badge>
          <div className="text-xs text-gray-400">{formatDistanceToNow(decision.lastMentioned, { addSuffix: true })}</div>
        </div>
      </div>

      {/* Body */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-4">
          Mentioned {decision.mentionCount} times since {format(decision.firstMentioned, "MMM d")}
        </div>
        
        {decision.options.length > 0 && (
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Options:</div>
            <div className="space-y-2">
              {decision.options.map((opt, i) => (
                <div key={opt.id} className="text-xs text-gray-300 leading-relaxed pl-2 border-l border-white/10">
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end items-center gap-2 pt-4 border-t border-white/5">
        <Button size="sm" variant="ghost" onClick={handleDefer} className="text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white h-8 px-3">
          Defer
        </Button>
        <Button size="sm" onClick={handleLock} className="bg-[#C17A72] hover:bg-[#C17A72]/90 text-white h-8 px-3">
          Lock Decision
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const LockedDecisionCard = ({ decision }: { decision: Decision }) => (
  <div className="bg-[#1F2D47]/60 border-l-[3px] border-[#6BA87A] rounded-[10px] p-6 mb-4 hover:bg-[#1F2D47]/70 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-white">{decision.title}</h3>
      <div className="text-right">
        <Badge className="bg-[#6BA87A] hover:bg-[#6BA87A] text-white border-none text-[11px] rounded-full px-2 gap-1 mb-1">
          <Check className="h-3 w-3" /> Locked
        </Badge>
        <div className="text-xs text-gray-400">
          {decision.lockedAt ? format(decision.lockedAt, "MMM d, h:mm a") : "Recently"}
        </div>
      </div>
    </div>

    {(decision.reasoning || decision.nextStep) && (
      <div className="grid gap-6 mb-6">
        {decision.reasoning && (
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Reasoning:</div>
            <p className="text-sm text-gray-200 italic leading-relaxed opacity-90">{decision.reasoning}</p>
          </div>
        )}
        {decision.nextStep && (
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Next Step:</div>
            <p className="text-sm text-gray-200 italic leading-relaxed opacity-90">{decision.nextStep}</p>
          </div>
        )}
      </div>
    )}

    {decision.executionStatus && (
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            Decided: {decision.lockedAt ? formatDistanceToNow(decision.lockedAt, { addSuffix: true }) : "Recently"}
          </span>
          <Badge variant="outline" className={`text-[10px] h-5 ${
            decision.executionStatus === 'completed' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
            decision.executionStatus === 'in-progress' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
            'border-gray-500/30 text-gray-400 bg-gray-500/10'
          }`}>
            {decision.executionStatus === 'completed' ? 'Completed' : 
             decision.executionStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
          </Badge>
        </div>
      </div>
    )}
  </div>
);

const DeferredDecisionCard = ({ decision }: { decision: Decision }) => (
  <div className="bg-[#1F2D47]/50 border-l-[3px] border-gray-500 rounded-[10px] p-6 mb-4 hover:bg-[#1F2D47]/60 transition-colors opacity-90 hover:opacity-100">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-white/90">{decision.title}</h3>
      <div className="text-right">
        <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-none text-[11px] rounded-full px-2 mb-1">Deferred</Badge>
        <div className="text-xs text-gray-500">
          Until {decision.deferredUntil ? format(decision.deferredUntil, "MMM d") : "TBD"}
        </div>
      </div>
    </div>

    <div className="flex gap-3 pt-4">
      <Button size="sm" className="bg-[#C17A72] hover:bg-[#C17A72]/90 text-white h-8 px-3 text-xs">
        Revisit Now
      </Button>
      <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 h-8 px-3 text-xs">
        Extend Deferral
      </Button>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-xl font-serif text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm max-w-md">{subtitle}</p>
  </div>
);

const TimelineItem = ({ decision }: { decision: Decision }) => (
  <div className="relative pl-8 group cursor-pointer">
    <div className={`absolute left-[-4px] top-1.5 h-2 w-2 rounded-full border-2 ${
      decision.status === 'locked' ? 'bg-[#6BA87A] border-[#6BA87A]' : 
      decision.status === 'deferred' ? 'bg-gray-500 border-gray-500' : 
      'bg-[#D89966] border-[#D89966]'
    } transition-all group-hover:scale-125`} />
    
    <div className="bg-[#1F2D47]/40 border border-white/5 rounded-lg p-3 hover:bg-[#1F2D47]/60 transition-colors flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-200">{decision.title}</div>
        <div className="text-xs text-gray-500">{format(decision.updatedAt, "MMM d")}</div>
      </div>
      <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] capitalize">
        {decision.status.replace('-', ' ')}
      </Badge>
    </div>
  </div>
);
