import { Search, Calendar as CalendarIcon, Mic, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  return (
    <div className="flex h-full w-full bg-[#0F1729] text-white overflow-hidden">
      {/* Middle Column - Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar p-8 border-r border-white/5">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-white tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
             <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                <Button variant="ghost" size="sm" className="text-xs h-7 px-3 bg-white/10 text-white hover:bg-white/20">This Week</Button>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-3 text-gray-400 hover:text-white hover:bg-white/5">This Month</Button>
             </div>
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search captures..." 
                  className="pl-9 h-9 bg-white/5 border-white/10 text-sm focus-visible:ring-accent focus-visible:border-accent/50 placeholder:text-gray-600" 
                />
             </div>
          </div>
        </header>

        {/* Element 5a: Weekly Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <MetricCard label="Captures made" value="24" suffix="captures" highlight />
           <MetricCard label="Decisions locked" value="3" suffix="decisions" />
           <MetricCard label="Priorities completed" value="2/3" suffix="priorities" />
           <MetricCard label="Focus time" value="12" suffix="hours" />
        </div>

        {/* Element 5b: Decision Bank */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-medium">Decision Bank</h2>
            <Button variant="link" className="text-accent h-auto p-0 text-sm hover:text-accent/80">View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </div>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 mb-6 h-10 p-1 w-fit">
              <TabsTrigger value="active" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Active Loops</TabsTrigger>
              <TabsTrigger value="resolved" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Resolved</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">All History</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-3 mt-0">
              <DecisionCard 
                title="Pricing Model: Usage-based vs. Flat-fee" 
                status="Locked Monday" 
                date="Dec 1" 
                statusColor="text-green-400"
                type="locked"
              />
              <DecisionCard 
                title="Hiring Timeline for Senior Engineer" 
                status="In Progress" 
                meta="Mentioned 2x" 
                statusColor="text-orange-400"
                type="progress"
              />
              <DecisionCard 
                title="Q1 Feature Roadmap Scope" 
                status="Pending" 
                meta="Mentioned 4x" 
                statusColor="text-red-400"
                isPending
                type="pending"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Element 5c: Recent Captures */}
        <div>
           <h2 className="text-xl font-serif font-medium mb-6">Recent Captures</h2>
           <div className="space-y-0 relative pl-4 ml-2">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
              <div className="mb-6 text-xs font-bold text-gray-500 uppercase tracking-wider -ml-6 bg-[#0F1729] py-1 inline-block px-2 z-10 relative">Today</div>
              
              <CaptureItem 
                time="2:34 PM" 
                type="voice" 
                content="Thinking about pricing model... usage-based would increase stickiness but harder to explain to enterprise clients."
                tags={["Pricing", "Growth"]}
              />
              <CaptureItem 
                time="11:20 AM" 
                type="text" 
                content="Need to schedule the team retrospective for Friday. Morale seems a bit low after the sprint deadline."
                tags={["Team", "Ops"]}
              />
              <CaptureItem 
                time="9:15 AM" 
                type="text" 
                content="Met with Sarah about the new design system tokens. We need to standardize the spacing scale."
                tags={["Design", "Product"]}
              />
           </div>
           <Button variant="ghost" className="w-full mt-4 text-gray-500 hover:text-white hover:bg-white/5 text-sm font-normal">Show earlier captures</Button>
        </div>
      </div>

      {/* Right Sidebar - Context Panel */}
      <div className="w-[320px] p-6 bg-[#0F1729]/95 backdrop-blur-xl border-l border-white/5 hidden xl:block overflow-y-auto">
        {/* Element 5d: Context Panel */}
        <div className="mb-8 p-6 bg-white/[0.03] rounded-xl border-l-2 border-accent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
            <AlertCircle className="h-24 w-24 text-accent" />
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Context</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white">
              <CheckCircle2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-5 relative z-10">
            <div>
              <div className="text-sm text-gray-500 mb-1">Runway Remaining</div>
              <div className="text-3xl font-serif text-accent">45 days</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <div className="text-xs text-gray-500 mb-1">Monthly Burn</div>
                <div className="text-base font-medium text-white">$8,500</div>
                </div>
                <div>
                <div className="text-xs text-gray-500 mb-1">Revenue (ARR)</div>
                <div className="text-base font-medium text-white">$2,100</div>
                </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Growth Rate</div>
              <div className="text-base font-medium text-green-400">3.2% <span className="text-xs text-gray-500 font-normal">weekly</span></div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
               <span className="text-xs font-bold text-green-500 tracking-wide">DEFAULT ALIVE</span>
            </div>
          </div>
        </div>

        {/* Element 5e: Priorities */}
        <div className="p-6 bg-white/[0.03] rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Top 3 This Week</h3>
          <div className="space-y-4">
             <PriorityItem number={1} text="Ship onboarding flow" completed />
             <PriorityItem number={2} text="Close 2 pilot customers" />
             <PriorityItem number={3} text="Team retrospective" />
          </div>
        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ label, value, suffix, highlight }: any) => (
  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group">
    <div className={`text-3xl font-serif mb-1 ${highlight ? 'text-accent' : 'text-white'}`}>{value}</div>
    <div className="text-xs text-gray-500 uppercase tracking-wide group-hover:text-gray-400 transition-colors">{label}</div>
  </div>
);

const DecisionCard = ({ title, status, date, meta, statusColor, isPending, type }: any) => (
  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] cursor-pointer transition-all group relative overflow-hidden">
    {type === 'pending' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />}
    {type === 'locked' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50" />}
    
    <div className="flex items-start justify-between mb-2 pl-2">
      <h4 className="font-medium text-base text-gray-200 group-hover:text-white transition-colors pr-4 leading-snug">{title}</h4>
      {isPending && <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />}
    </div>
    <div className="flex items-center gap-2 text-xs pl-2">
       <span className={`font-medium ${statusColor}`}>{status}</span>
       {(date || meta) && (
           <>
            <span className="text-gray-700">•</span>
            <span className="text-gray-500">{date || meta}</span>
           </>
       )}
    </div>
  </div>
);

const CaptureItem = ({ time, type, content, tags }: any) => (
  <div className="relative pl-8 pb-8 group last:pb-0">
    <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#0F1729] border-2 border-white/20 group-hover:border-accent transition-colors z-10" />
    
    <div className="mb-2 flex items-center gap-3">
       <span className="text-xs font-mono text-gray-500">{time}</span>
       {type === 'voice' ? <Mic className="h-3 w-3 text-gray-600" /> : <CheckCircle2 className="h-3 w-3 text-gray-600" />}
    </div>
    <p className="text-sm text-gray-300 leading-relaxed mb-3 line-clamp-2 group-hover:text-white transition-colors">{content}</p>
    <div className="flex gap-2">
       {tags.map((tag: string) => (
         <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border-transparent">{tag}</Badge>
       ))}
    </div>
  </div>
);

const PriorityItem = ({ number, text, completed }: any) => (
  <div className={`flex items-start gap-3 text-sm group ${completed ? 'opacity-50' : ''}`}>
    <div className={`h-5 w-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white'}`}>
      {completed ? <CheckCircle2 className="h-3 w-3" /> : number}
    </div>
    <span className={`leading-snug ${completed ? 'line-through text-gray-500' : 'text-gray-300 group-hover:text-white'}`}>{text}</span>
  </div>
);

