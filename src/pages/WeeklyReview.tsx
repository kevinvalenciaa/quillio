import { X, ArrowRight, ArrowUp, AlertCircle, CheckCircle2, Clock, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function WeeklyReview() {
  const navigate = useNavigate();

  const pieData = [
    { name: "Operational", value: 70, color: "#8B5A5A" },
    { name: "Meetings", value: 15, color: "#5A7B8B" },
    { name: "Sales/Growth", value: 8, color: "#C17A72" },
    { name: "Strategy", value: 5, color: "#D89966" },
    { name: "Other", value: 2, color: "#6B7280" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0F1729] w-full max-w-5xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative my-8 min-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-8 border-b border-white/10 flex items-start justify-between bg-[#0F1729] shrink-0 relative z-10">
           <div className="text-center w-full">
              <h1 className="text-4xl font-serif text-white mb-2">Your Week in Review</h1>
              <p className="text-lg text-gray-400">What you did vs. what you said you'd do</p>
           </div>
           <Button 
             variant="ghost" 
             size="icon" 
             className="absolute right-8 top-8 rounded-full hover:bg-white/10" 
             onClick={() => navigate("/")}
           >
              <X className="h-6 w-6 text-gray-400" />
           </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 sm:p-12 space-y-16 overflow-y-auto bg-[#0F1729]">
            
            {/* Section 1: Time Allocation */}
            <section className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-2xl font-serif text-white mb-8">How You Actually Spent Your Time</h2>
                    <div className="h-[300px] w-full relative">
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                 <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={140}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                 >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                 </Pie>
                                 <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2D47', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                 />
                             </PieChart>
                         </ResponsiveContainer>
                         {/* Legend */}
                         <div className="flex flex-wrap justify-center gap-4 mt-4">
                             {pieData.map((entry) => (
                                 <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                                     <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                                     {entry.name} ({entry.value}%)
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-base font-bold text-white">Your stated top 3 priorities vs. time spent:</h3>
                    <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-1">Priority</div>
                            <div className="text-center">Allocated</div>
                            <div className="text-center">Actual</div>
                            <div className="text-right">Status</div>
                        </div>
                        <div className="p-4 space-y-4">
                            <PriorityRow name="Ship onboarding flow" allocated="30%" actual="8%" status="Missed" statusColor="text-red-400" />
                            <PriorityRow name="Close 2 pilot customers" allocated="25%" actual="18%" status="Behind" statusColor="text-orange-400" />
                            <PriorityRow name="Team retrospective" allocated="10%" actual="12%" status="On Track" statusColor="text-green-400" />
                        </div>
                    </div>
                    <div className="p-4 border-l-2 border-gray-600 bg-white/5 rounded-r-lg">
                        <p className="text-sm text-gray-300 italic leading-relaxed">
                            "You spent <span className="text-white font-bold">70% on operational tasks</span> but only <span className="text-white font-bold">8% on growth-driving activities</span>. This is typical for founders, but it's also why runway shrinks faster than expected."
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Runway Reality Check */}
            <section>
                <h2 className="text-2xl font-serif text-white mb-8">Runway Impact: The Math</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <MetricBox label="Weekly Burn" value="$1,962" />
                    <MetricBox label="Weekly Revenue" value="$156" />
                    <MetricBox label="Net Burn" value="$1,806" color="text-accent" />
                    <MetricBox label="Runway Remaining" value="45 days" color="text-accent" large />
                </div>
                
                <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-8 mb-8">
                     <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                         <span>0 days</span>
                         <span>45 days</span>
                         <span>365 days</span>
                     </div>
                     <div className="h-8 w-full bg-white/5 rounded overflow-hidden relative">
                         <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-400 to-red-500 w-[12%]" />
                     </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-[#1F2D47]/50 border border-white/5 rounded-xl p-6">
                         <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Current State</h4>
                         <div className="text-2xl font-serif text-accent mb-2">Runway: 45 days</div>
                         <div className="text-sm text-gray-500">70% ops, 8% growth, 22% other</div>
                    </div>
                    <div className="bg-[#1F2D47]/60 border border-green-500/20 rounded-xl p-6 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                             <TrendingUp className="h-24 w-24 text-green-500" />
                         </div>
                         <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">If you shift 10% from ops to growth</h4>
                         <div className="flex items-end gap-3 mb-2">
                             <div className="text-2xl font-serif text-green-400">Runway: 59 days</div>
                             <div className="text-sm font-bold text-green-500 mb-1">+14 days</div>
                         </div>
                         <div className="text-sm text-gray-500">50% ops, 18% growth, 32% other</div>
                    </div>
                </div>
            </section>

            {/* Section 3: Decisions & Execution */}
            <section className="grid lg:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-serif text-white mb-6">Decisions Made This Week</h2>
                    <div className="space-y-4">
                        <LockedDecision 
                            title="Usage-based pricing ($0.10 per capture)"
                            date="Tuesday, Dec 3 @ 9:15 AM"
                            nextStep="Launch pricing page by Dec 10"
                        />
                         <div className="bg-[#1F2D47]/30 border border-white/5 rounded-lg p-6 text-center text-gray-500 text-sm italic">
                            No other decisions locked. 2 active loops pending.
                         </div>
                    </div>
                </div>
                <div>
                     <h2 className="text-2xl font-serif text-white mb-6">Progress on Last Week</h2>
                     <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6 space-y-6">
                         <ProgressItem 
                            title="Pricing Model" 
                            task="Launch pricing page" 
                            progress={100} 
                            status="done"
                         />
                         <ProgressItem 
                            title="Hiring Timeline" 
                            task="Schedule interviews with 3 candidates" 
                            progress={60} 
                            status="in_progress"
                         />
                         <ProgressItem 
                            title="Feature Roadmap" 
                            task="Finalize roadmap with team" 
                            progress={0} 
                            status="todo"
                         />
                     </div>
                </div>
            </section>

            {/* Section 4: Strategic Insights */}
            <section>
                 <h2 className="text-2xl font-serif text-white mb-8">Key Insights</h2>
                 <div className="grid md:grid-cols-3 gap-6">
                     <InsightCard 
                        icon={Lightbulb}
                        text="You've mentioned 'hiring timeline' 6 times over 2 weeks. This is your #1 blocking concern and needs a decision."
                        action="View in Decision Bank"
                     />
                     <InsightCard 
                        icon={TrendingUp}
                        text="At 8% growth this week (below your 5-7% target), prioritizing sales conversations could help."
                        action="See time allocation details"
                     />
                     <InsightCard 
                        icon={Clock}
                        text="Runway extended to 59 days if you can increase revenue by $150/week. Next 3 weeks are critical."
                        action="Update revenue forecast"
                     />
                 </div>
            </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0F1729] flex items-center justify-between shrink-0 z-10">
             <div className="text-xs text-gray-500">Next ritual: Monday at 9 AM</div>
             <div className="flex gap-4">
                 <Button variant="ghost" onClick={() => navigate("/")} className="text-gray-400 hover:text-white">Back to Dashboard</Button>
                 <Button variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5">View Full Analytics</Button>
                 <Button onClick={() => navigate("/")} className="bg-accent hover:bg-accent/90 text-white px-8">Done</Button>
             </div>
        </div>
      </div>
    </div>
  );
}

const PriorityRow = ({ name, allocated, actual, status, statusColor }: any) => (
    <div className="grid grid-cols-4 gap-4 items-center text-sm">
        <div className="col-span-1 font-medium text-white truncate">{name}</div>
        <div className="text-center text-gray-400">{allocated}</div>
        <div className="text-center text-white font-bold">{actual}</div>
        <div className={`text-right font-bold ${statusColor}`}>{status}</div>
    </div>
)

const MetricBox = ({ label, value, color, large }: any) => (
    <div className={`bg-[#1F2D47]/70 border-l-4 ${color ? 'border-accent' : 'border-gray-600'} rounded-lg p-5`}>
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">{label}</div>
        <div className={`font-bold text-white ${large ? 'text-3xl text-accent' : 'text-2xl'} ${color || ''}`}>{value}</div>
    </div>
)

const LockedDecision = ({ title, date, nextStep }: any) => (
    <div className="bg-[#1F2D47]/70 border-l-[3px] border-green-500 rounded-lg p-5">
        <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-white text-lg">{title}</div>
            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-none text-[10px]">✓ Locked</Badge>
        </div>
        <div className="text-xs text-gray-500 mb-3">{date}</div>
        <div className="text-sm text-gray-300 italic">Next: {nextStep}</div>
    </div>
)

const ProgressItem = ({ title, task, progress, status }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-300 flex items-center gap-2">
                {status === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                 status === 'in_progress' ? <Clock className="h-4 w-4 text-orange-500" /> : 
                 <X className="h-4 w-4 text-red-500" />}
                {title}
            </span>
            <span className="text-gray-500 font-mono">{progress}%</span>
        </div>
        <div className="text-xs text-gray-500 ml-6 mb-1">{task}</div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden ml-6">
            <div 
                className={`h-full transition-all duration-1000 ${status === 'done' ? 'bg-green-500' : status === 'in_progress' ? 'bg-orange-500' : 'bg-red-500'}`} 
                style={{ width: `${progress}%` }} 
            />
        </div>
    </div>
)

const InsightCard = ({ icon: Icon, text, action }: any) => (
    <div className="bg-[#1F2D47]/70 border-l-[3px] border-accent rounded-lg p-5 hover:bg-[#1F2D47]/90 transition-colors group">
        <Icon className="h-6 w-6 text-accent mb-3" />
        <p className="text-sm text-gray-200 leading-relaxed mb-4">{text}</p>
        <div className="flex items-center text-xs text-accent font-medium cursor-pointer hover:underline">
            {action} <ArrowRight className="ml-1 h-3 w-3" />
        </div>
    </div>
)

