import { ArrowRight, CheckCircle2, Clock, TrendingUp, Lightbulb, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAppData } from "@/context/AppDataContext";
import { format } from "date-fns";

export default function WeeklyReview() {
  const navigate = useNavigate();
  const { captures, decisions, priorities, founderContext, lockedDecisions, activeLoops, loading } = useAppData();

  // Calculate time allocation from capture categories
  const categoryCounts = captures.reduce((acc, capture) => {
    const cat = capture.category || 'uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = captures.length || 1;
  
  const pieData = [
    { name: "Decisions", value: Math.round((categoryCounts['decision'] || 0) / total * 100), color: "#C17A72" },
    { name: "Concerns", value: Math.round((categoryCounts['concern'] || 0) / total * 100), color: "#8B5A5A" },
    { name: "Ideas", value: Math.round((categoryCounts['idea'] || 0) / total * 100), color: "#D89966" },
    { name: "Progress", value: Math.round((categoryCounts['progress'] || 0) / total * 100), color: "#6BA87A" },
    { name: "Other", value: Math.round((categoryCounts['uncategorized'] || 0) / total * 100), color: "#6B7280" },
  ].filter(d => d.value > 0);

  // Calculate weekly burn (monthly / 4)
  const weeklyBurn = Math.round(founderContext.monthlyBurnRate / 4);
  const weeklyRevenue = Math.round(founderContext.monthlyRevenue / 4);
  const netBurn = weeklyBurn - weeklyRevenue;

  // Recent locked decisions
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const recentLockedDecisions = lockedDecisions.filter(d => d.lockedAt && d.lockedAt >= weekStart.getTime());

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
      <header className="px-8 pt-8 pb-6 shrink-0 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif text-white mb-1">Weekly Review</h1>
            <p className="text-sm text-gray-400">What you did vs. what you said you'd do</p>
          </div>
          <div className="text-xs text-gray-500">Next ritual: Monday at 9 AM</div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Section 1: Time Allocation */}
          <section className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-xl font-serif text-white mb-6">How You Spent Your Time</h2>
              {captures.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No captures this week</p>
                    <p className="text-sm text-gray-600">Start capturing to see your time allocation</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-[280px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
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
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                        {entry.name} ({entry.value}%)
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white">Your priorities vs. time spent:</h3>
              {priorities.length === 0 ? (
                <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-gray-500">No priorities set this week</p>
                  <Button 
                    variant="link" 
                    className="text-accent mt-2" 
                    onClick={() => navigate('/ritual')}
                  >
                    Set priorities in Monday Ritual
                  </Button>
                </div>
              ) : (
                <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">Priority</div>
                    <div className="text-center">Allocated</div>
                    <div className="text-center">Actual</div>
                    <div className="text-right">Status</div>
                  </div>
                  <div className="p-4 space-y-4">
                    {priorities.slice(0, 3).map((priority) => (
                      <PriorityRow 
                        key={priority.id}
                        name={priority.content} 
                        allocated={`${priority.allocatedTime}%`} 
                        actual={priority.actualTime !== undefined ? `${priority.actualTime}%` : "—"} 
                        status={priority.status === 'completed' ? 'Completed' : 
                               priority.status === 'on-track' ? 'On Track' : 
                               priority.status === 'behind' ? 'Behind' : 
                               priority.status === 'missed' ? 'Missed' : 'Pending'} 
                        statusColor={priority.status === 'completed' ? 'text-green-400' : 
                                    priority.status === 'on-track' ? 'text-green-400' : 
                                    priority.status === 'behind' ? 'text-orange-400' : 
                                    priority.status === 'missed' ? 'text-red-400' : 'text-gray-400'} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Runway Reality Check */}
          <section>
            <h2 className="text-xl font-serif text-white mb-6">Runway Impact: The Math</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricBox label="Weekly Burn" value={`$${weeklyBurn.toLocaleString()}`} />
              <MetricBox label="Weekly Revenue" value={`$${weeklyRevenue.toLocaleString()}`} />
              <MetricBox label="Net Burn" value={`$${netBurn.toLocaleString()}`} color="text-accent" />
              <MetricBox label="Runway Remaining" value={`${founderContext.runway} days`} color="text-accent" large />
            </div>
            
            <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                <span>0 days</span>
                <span>{founderContext.runway} days</span>
                <span>365 days</span>
              </div>
              <div className="h-6 w-full bg-white/5 rounded overflow-hidden relative">
                <div 
                  className={`absolute left-0 top-0 bottom-0 ${founderContext.runway < 90 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`} 
                  style={{ width: `${Math.min(100, (founderContext.runway / 365) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#1F2D47]/50 border border-white/5 rounded-xl p-5">
                <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Current State</h4>
                <div className={`text-xl font-serif mb-1 ${founderContext.runway < 90 ? 'text-accent' : 'text-white'}`}>
                  Runway: {founderContext.runway} days
                </div>
                <div className="text-sm text-gray-500">
                  Growth: {founderContext.weeklyGrowthRate}% weekly (target: {founderContext.weeklyGrowthTarget}%)
                </div>
              </div>
              <div className="bg-[#1F2D47]/60 border border-green-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <TrendingUp className="h-20 w-20 text-green-500" />
                </div>
                <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">If you hit growth target</h4>
                <div className="flex items-end gap-3 mb-1">
                  <div className="text-xl font-serif text-green-400">
                    Runway: {founderContext.runway + 14} days
                  </div>
                  <div className="text-sm font-bold text-green-500">+14 days</div>
                </div>
                <div className="text-sm text-gray-500">
                  At {founderContext.weeklyGrowthTarget}% weekly growth
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Decisions & Execution */}
          <section className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-serif text-white mb-5">Decisions Made This Week</h2>
              <div className="space-y-4">
                {recentLockedDecisions.length === 0 ? (
                  <div className="bg-[#1F2D47]/30 border border-white/5 rounded-lg p-5 text-center text-gray-500 text-sm italic">
                    No decisions locked this week. {activeLoops.length > 0 && `${activeLoops.length} active loops pending.`}
                  </div>
                ) : (
                  recentLockedDecisions.map((decision) => (
                    <LockedDecision 
                      key={decision.id}
                      title={decision.selectedOption || decision.title}
                      date={decision.lockedAt ? format(decision.lockedAt, "EEEE, MMM d @ h:mm a") : "Recently"}
                      nextStep={decision.nextStep || "Execute this week"}
                    />
                  ))
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-serif text-white mb-5">Active Decision Loops</h2>
              <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-5 space-y-5">
                {activeLoops.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm italic">
                    No active decision loops. Great work!
                  </div>
                ) : (
                  activeLoops.slice(0, 3).map((loop) => (
                    <ProgressItem 
                      key={loop.id}
                      title={loop.title} 
                      task={`Mentioned ${loop.mentionCount} times`} 
                      progress={0} 
                      status="todo"
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Strategic Insights */}
          <section>
            <h2 className="text-xl font-serif text-white mb-6">Key Insights</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {activeLoops.length > 0 && (
                <InsightCard 
                  icon={Lightbulb}
                  text={`You have ${activeLoops.length} active decision loop${activeLoops.length > 1 ? 's' : ''}. Consider locking a decision in your next Monday ritual.`}
                  action="View Decision Bank"
                  onClick={() => navigate('/decisions')}
                />
              )}
              {founderContext.weeklyGrowthRate < founderContext.weeklyGrowthTarget && (
                <InsightCard 
                  icon={TrendingUp}
                  text={`Growth is at ${founderContext.weeklyGrowthRate}% (below ${founderContext.weeklyGrowthTarget}% target). Consider prioritizing growth activities.`}
                  action="Update priorities"
                  onClick={() => navigate('/ritual')}
                />
              )}
              {founderContext.runway < 90 && (
                <InsightCard 
                  icon={Clock}
                  text={`Runway is ${founderContext.runway} days. Focus on revenue-generating activities and consider cutting burn.`}
                  action="Update context"
                  onClick={() => navigate('/settings')}
                />
              )}
              {activeLoops.length === 0 && founderContext.weeklyGrowthRate >= founderContext.weeklyGrowthTarget && founderContext.runway >= 90 && (
                <InsightCard 
                  icon={CheckCircle2}
                  text="Great week! No major concerns. Keep capturing your thoughts and stay focused."
                  action="Go to Dashboard"
                  onClick={() => navigate('/')}
                />
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

const PriorityRow = ({ name, allocated, actual, status, statusColor }: { name: string; allocated: string; actual: string; status: string; statusColor: string }) => (
  <div className="grid grid-cols-4 gap-4 items-center text-sm">
    <div className="col-span-1 font-medium text-white truncate">{name}</div>
    <div className="text-center text-gray-400">{allocated}</div>
    <div className="text-center text-white font-bold">{actual}</div>
    <div className={`text-right font-bold ${statusColor}`}>{status}</div>
  </div>
);

const MetricBox = ({ label, value, color, large }: { label: string; value: string; color?: string; large?: boolean }) => (
  <div className={`bg-[#1F2D47]/70 border-l-4 ${color ? 'border-accent' : 'border-gray-600'} rounded-lg p-4`}>
    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">{label}</div>
    <div className={`font-bold text-white ${large ? 'text-2xl text-accent' : 'text-xl'} ${color || ''}`}>{value}</div>
  </div>
);

const LockedDecision = ({ title, date, nextStep }: { title: string; date: string; nextStep: string }) => (
  <div className="bg-[#1F2D47]/70 border-l-[3px] border-green-500 rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <div className="font-bold text-white">{title}</div>
      <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-none text-[10px]">✓ Locked</Badge>
    </div>
    <div className="text-xs text-gray-500 mb-2">{date}</div>
    <div className="text-sm text-gray-300 italic">Next: {nextStep}</div>
  </div>
);

const ProgressItem = ({ title, task, progress, status }: { title: string; task: string; progress: number; status: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="font-medium text-gray-300 flex items-center gap-2">
        {status === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
         status === 'in_progress' ? <Clock className="h-4 w-4 text-orange-500" /> : 
         <AlertCircle className="h-4 w-4 text-orange-500" />}
        {title}
      </span>
    </div>
    <div className="text-xs text-gray-500 ml-6">{task}</div>
  </div>
);

const InsightCard = ({ icon: Icon, text, action, onClick }: { icon: any; text: string; action: string; onClick?: () => void }) => (
  <div 
    className="bg-[#1F2D47]/70 border-l-[3px] border-accent rounded-lg p-4 hover:bg-[#1F2D47]/90 transition-colors group cursor-pointer"
    onClick={onClick}
  >
    <Icon className="h-5 w-5 text-accent mb-3" />
    <p className="text-sm text-gray-200 leading-relaxed mb-3">{text}</p>
    <div className="flex items-center text-xs text-accent font-medium hover:underline">
      {action} <ArrowRight className="ml-1 h-3 w-3" />
    </div>
  </div>
);
