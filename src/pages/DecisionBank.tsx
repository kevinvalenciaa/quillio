import { useState } from "react";
import { Search, Filter, MoreHorizontal, Check, ChevronDown, ChevronUp, Clock, Lock, AlertCircle, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function DecisionBank() {
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
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">Highest Impact</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 border-b border-white/10 bg-[#1F2D47]">
            <TabsList className="h-auto p-0 bg-transparent space-x-8">
                <TabTrigger value="active" label="Active Loops" />
                <TabTrigger value="locked" label="Locked Decisions" />
                <TabTrigger value="deferred" label="Deferred" />
                <TabTrigger value="all" label="All Decisions" />
            </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0F1729]">
            <TabsContent value="active" className="m-0 space-y-6 max-w-4xl mx-auto">
                <ActiveLoopCard 
                    title="Pricing Model: Usage-based vs. Flat-fee"
                    status="Active Loop"
                    lastMentioned="2 hours ago"
                    context="Mentioned 4 times over 3 days"
                    captures={[
                        "Day 1 @ 2:34 PM: 'Usage-based would increase stickiness but harder to explain...'",
                        "Day 2 @ 10:15 AM: 'If we go flat-fee, $30/month feels too high for early founders...'",
                        "Day 3 @ 3:45 PM: 'Usage-based pricing would align with value delivered...'",
                        "Day 3 @ 5:20 PM: 'But flat-fee is easier to forecast and explain'"
                    ]}
                    options={[
                        "Option A: Usage-based ($0.10 per capture)",
                        "Option B: Flat-fee ($30/month)",
                        "Option C: Hybrid (base + usage)"
                    ]}
                />
                {/* Empty State Example (Commented out for now, can be toggled logic) */}
                {/* <EmptyState 
                    icon={Check} 
                    title="No active loops right now. Great work!" 
                    subtitle="Keep capturing your thoughts—we'll surface loops when they appear." 
                /> */}
            </TabsContent>

            <TabsContent value="locked" className="m-0 space-y-6 max-w-4xl mx-auto">
                <LockedDecisionCard 
                    title="Pricing Model: Usage-based ($0.10 per capture)"
                    lockedDate="Locked Monday, Dec 2 @ 9:15 AM"
                    reasoning="Usage-based pricing aligns incentives with value delivered. Easier to attract price-sensitive founders with pay-as-you-go model. Can adjust pricing tier if customer feedback suggests complexity is an issue."
                    nextStep="Document pricing page copy by Wed. Set up Stripe integration by Fri. Launch pricing page in Beta section of website next week."
                    timeline="3 days ago"
                    status="In Progress"
                />
            </TabsContent>

            <TabsContent value="deferred" className="m-0 space-y-6 max-w-4xl mx-auto">
                 <DeferredDecisionCard 
                    title="Hire VP of Sales: Immediate vs. Wait until Series A"
                    deferredUntil="Week of Jan 13"
                    reason="Need to close 2 pilot customers first to justify hire to board. Revisit decision when pilots close."
                    context="Runway: 90 days | Growth: 4.5% weekly"
                 />
            </TabsContent>
            
            <TabsContent value="all" className="m-0 max-w-4xl mx-auto">
                <div className="relative border-l border-white/10 ml-6 space-y-8 py-4">
                     <TimelineGroup date="December 2024" />
                     <TimelineItem 
                        title="Pricing Model: Usage-based"
                        status="locked"
                        date="Dec 2"
                     />
                     <TimelineItem 
                        title="Hire VP of Sales"
                        status="deferred"
                        date="Dec 1"
                     />
                     <TimelineItem 
                        title="Q1 Roadmap"
                        status="active"
                        date="Nov 28"
                     />
                </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

const TabTrigger = ({ value, label }: { value: string, label: string }) => (
    <TabsTrigger 
        value={value} 
        className="px-3 py-4 text-sm font-medium text-white/60 data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_0_#C17A72] rounded-none transition-all hover:text-white/80"
    >
        {label}
    </TabsTrigger>
)

const ActiveLoopCard = ({ title, status, lastMentioned, context, captures, options }: any) => {
    const [expanded, setExpanded] = useState(false);
    const displayedCaptures = expanded ? captures : captures.slice(0, 2);

    return (
        <div className="bg-[#1F2D47]/70 border-l-[3px] border-[#D89966] rounded-[10px] p-6 mb-4 hover:bg-[#1F2D47]/85 transition-colors group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <div className="text-right">
                    <Badge className="bg-[#D89966] hover:bg-[#D89966] text-white border-none text-[11px] rounded-full px-2 mb-1">{status}</Badge>
                    <div className="text-xs text-gray-400">{lastMentioned}</div>
                </div>
            </div>

            {/* Body */}
            <div className="mb-6">
                <div className="text-sm text-gray-400 mb-4">{context}</div>
                
                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Associated Captures:</div>
                    <div className="space-y-2">
                        {displayedCaptures.map((capture: string, i: number) => (
                            <div key={i} className="text-xs text-gray-300 leading-relaxed pl-2 border-l border-white/10">
                                {capture}
                            </div>
                        ))}
                    </div>
                    {captures.length > 2 && (
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-xs text-[#C17A72] mt-2 hover:text-[#C17A72]/80 font-medium"
                        >
                            {expanded ? 'Show less' : `Show ${captures.length - 2} more`} 
                            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1 w-full">
                    {options.map((opt: string, i: number) => (
                        <div key={i} className="text-xs text-gray-400">{opt}</div>
                    ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" className="text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white h-8 px-3">Defer</Button>
                    <Button size="sm" className="bg-[#C17A72] hover:bg-[#C17A72]/90 text-white h-8 px-3">Lock Decision</Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
    )
}

const LockedDecisionCard = ({ title, lockedDate, reasoning, nextStep, timeline, status }: any) => (
    <div className="bg-[#1F2D47]/60 border-l-[3px] border-[#6BA87A] rounded-[10px] p-6 mb-4 hover:bg-[#1F2D47]/70 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="text-right">
                <Badge className="bg-[#6BA87A] hover:bg-[#6BA87A] text-white border-none text-[11px] rounded-full px-2 gap-1 mb-1">
                    <Check className="h-3 w-3" /> Locked
                </Badge>
                <div className="text-xs text-gray-400">{lockedDate}</div>
            </div>
        </div>

        <div className="grid gap-6 mb-6">
            <div>
                <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Reasoning:</div>
                <p className="text-sm text-gray-200 italic leading-relaxed opacity-90">{reasoning}</p>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Next Step:</div>
                <p className="text-sm text-gray-200 italic leading-relaxed opacity-90">{nextStep}</p>
            </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">Decided: {timeline}</span>
                <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10 text-[10px] h-5">{status}</Badge>
            </div>
            <div className="flex gap-2">
                 <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400 hover:text-white">Edit Reasoning</Button>
                 <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400 hover:text-white">Archive</Button>
            </div>
        </div>
    </div>
)

const DeferredDecisionCard = ({ title, deferredUntil, reason, context }: any) => (
    <div className="bg-[#1F2D47]/50 border-l-[3px] border-gray-500 rounded-[10px] p-6 mb-4 hover:bg-[#1F2D47]/60 transition-colors opacity-90 hover:opacity-100">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white/90">{title}</h3>
            <div className="text-right">
                <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-none text-[11px] rounded-full px-2 mb-1">Deferred</Badge>
                <div className="text-xs text-gray-500">Until {deferredUntil}</div>
            </div>
        </div>

        <div className="mb-6 space-y-3">
             <p className="text-sm text-gray-400 italic">{reason}</p>
             <div className="text-xs text-gray-500 font-mono">{context}</div>
        </div>

        <div className="flex gap-3">
            <Button size="sm" className="bg-[#C17A72] hover:bg-[#C17A72]/90 text-white h-8 px-3 text-xs">Revisit Now</Button>
            <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 h-8 px-3 text-xs">Extend Deferral</Button>
        </div>
    </div>
)

const EmptyState = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-serif text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm max-w-md">{subtitle}</p>
    </div>
)

const TimelineGroup = ({ date }: { date: string }) => (
    <div className="relative pl-8">
        <span className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-white/20" />
        <h3 className="text-base font-bold text-gray-400 mb-4">{date}</h3>
    </div>
)

const TimelineItem = ({ title, status, date }: any) => (
    <div className="relative pl-8 group cursor-pointer">
        <div className={`absolute left-[-4px] top-1.5 h-2 w-2 rounded-full border-2 ${
            status === 'locked' ? 'bg-[#6BA87A] border-[#6BA87A]' : 
            status === 'deferred' ? 'bg-gray-500 border-gray-500' : 
            'bg-[#D89966] border-[#D89966]'
        } transition-all group-hover:scale-125`} />
        
        <div className="bg-[#1F2D47]/40 border border-white/5 rounded-lg p-3 hover:bg-[#1F2D47]/60 transition-colors flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-gray-200">{title}</div>
                <div className="text-xs text-gray-500">{date}</div>
            </div>
            <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] capitalize">{status}</Badge>
        </div>
    </div>
)

