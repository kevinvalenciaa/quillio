import { X, CheckCircle2, Clock, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/context/AppDataContext";
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from "date-fns";

export default function FridayRecap() {
  const navigate = useNavigate();
  const { 
    captures, 
    priorities, 
    decisions, 
    lockedDecisions,
    founderContext,
    loading 
  } = useAppData();

  // Calculate this week's date range
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  // Get this week's data
  const thisWeekCaptures = captures.filter(c => 
    isWithinInterval(new Date(c.timestamp), { start: weekStart, end: weekEnd })
  );
  
  const thisWeekDecisionsLocked = lockedDecisions.filter(d => 
    d.lockedAt && isWithinInterval(new Date(d.lockedAt), { start: weekStart, end: weekEnd })
  );

  // Calculate time allocation from capture categories
  const categoryBreakdown = thisWeekCaptures.reduce((acc, capture) => {
    acc[capture.category] = (acc[capture.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCaptures = thisWeekCaptures.length;
  
  // Map categories to time allocation (rough estimation based on captures)
  const timeAllocation = {
    operational: Math.round(((categoryBreakdown['concern'] || 0) + (categoryBreakdown['progress'] || 0)) / Math.max(totalCaptures, 1) * 100),
    strategic: Math.round((categoryBreakdown['decision'] || 0) / Math.max(totalCaptures, 1) * 100),
    growth: Math.round((categoryBreakdown['idea'] || 0) / Math.max(totalCaptures, 1) * 100),
    other: Math.round((categoryBreakdown['uncategorized'] || 0) / Math.max(totalCaptures, 1) * 100),
  };

  // Ensure percentages add up to 100
  const totalPercent = Object.values(timeAllocation).reduce((a, b) => a + b, 0);
  if (totalPercent > 0 && totalPercent !== 100) {
    timeAllocation.operational = 100 - timeAllocation.strategic - timeAllocation.growth - timeAllocation.other;
  }

  // Get runway and financial data
  const { runway, monthlyBurnRate, monthlyRevenue, weeklyGrowthRate, weeklyGrowthTarget } = founderContext;
  const weeklyBurn = Math.round(monthlyBurnRate / 4);
  const weeklyRevenue = Math.round(monthlyRevenue / 4);
  const netWeeklyBurn = weeklyBurn - weeklyRevenue;

  // Calculate if growth target was hit
  const growthGap = weeklyGrowthTarget - weeklyGrowthRate;
  const isOnTrack = weeklyGrowthRate >= weeklyGrowthTarget;

  // Get priority completion status
  const completedPriorities = priorities.filter(p => p.status === 'completed').length;
  const totalPriorities = priorities.length;

  // Default alive/dead status
  const defaultAliveStatus = founderContext.defaultAliveStatus;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0F1729] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-[#0F1729] shrink-0">
          <div>
            <h1 className="text-2xl font-serif text-white tracking-tight">Week Recap</h1>
            <p className="text-sm text-gray-500">{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => navigate("/")}>
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0F1729] space-y-8">
          
          {/* Time Allocation */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">How You Spent Your Time</h2>
            {totalCaptures > 0 ? (
              <>
                <div className="space-y-4">
                  <AllocationItem 
                    label="Operational (concerns + progress)" 
                    percent={timeAllocation.operational} 
                    color="bg-orange-500" 
                    warning={timeAllocation.operational > 50}
                  />
                  <AllocationItem 
                    label="Strategic (decisions)" 
                    percent={timeAllocation.strategic} 
                    color="bg-blue-500" 
                  />
                  <AllocationItem 
                    label="Growth (ideas)" 
                    percent={timeAllocation.growth} 
                    color="bg-accent" 
                    highlight={timeAllocation.growth > 20}
                  />
                  <AllocationItem 
                    label="Other" 
                    percent={timeAllocation.other} 
                    color="bg-gray-600" 
                  />
                </div>
                {timeAllocation.operational > 50 && (
                  <p className="text-sm text-orange-400 mt-4 italic border-l-2 border-orange-500/50 pl-4 py-1">
                    ⚠️ Over 50% on operational tasks. Consider delegating or automating.
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-xl">
                <p className="text-gray-400">No captures this week to analyze.</p>
                <p className="text-sm text-gray-500 mt-2">Start capturing your thoughts to see time allocation.</p>
              </div>
            )}
          </div>

          {/* Runway Reality Check */}
          <div className="bg-white/[0.03] rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              {defaultAliveStatus === 'alive' ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : defaultAliveStatus === 'dead' ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              Runway Reality Check
            </h2>
            
            {runway > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Burn Rate</div>
                    <div className="text-xl font-bold text-white">${monthlyBurnRate.toLocaleString()}/mo</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Revenue</div>
                    <div className="text-xl font-bold text-white">${monthlyRevenue.toLocaleString()}/mo</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Runway</div>
                    <div className={`text-2xl font-bold font-serif ${
                      runway < 60 ? 'text-red-400' : runway < 120 ? 'text-orange-400' : 'text-accent'
                    }`}>
                      {runway} days
                    </div>
                  </div>
                </div>

                {/* Growth tracking */}
                <div className="mb-6 p-4 rounded-lg bg-black/20 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Weekly Growth Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${isOnTrack ? 'text-green-400' : 'text-orange-400'}`}>
                        {weeklyGrowthRate}%
                      </span>
                      <span className="text-gray-500">/</span>
                      <span className="text-sm text-gray-400">{weeklyGrowthTarget}% target</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isOnTrack ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(100, (weeklyGrowthRate / weeklyGrowthTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-300 bg-black/20 p-4 rounded-lg leading-relaxed border border-white/5">
                  {isOnTrack ? (
                    <span className="text-green-400">✓ You're on track!</span>
                  ) : (
                    <>
                      You're <span className="text-orange-400 font-bold">{growthGap.toFixed(1)}% below</span> your growth target.
                      At current burn (${netWeeklyBurn.toLocaleString()}/week), you have <span className="text-white font-bold">{runway} days</span> to course correct.
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No financial context set.</p>
                <Button 
                  variant="link" 
                  className="text-accent"
                  onClick={() => navigate('/settings?tab=context')}
                >
                  Add your runway data →
                </Button>
              </div>
            )}
          </div>

          {/* Decisions & Priorities */}
          <div className="grid grid-cols-2 gap-6">
            {/* Decisions Made */}
            <div className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Decisions Locked</h3>
              {thisWeekDecisionsLocked.length > 0 ? (
                <div className="space-y-3">
                  {thisWeekDecisionsLocked.slice(0, 3).map(decision => (
                    <div key={decision.id} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{decision.title}</span>
                    </div>
                  ))}
                  {thisWeekDecisionsLocked.length > 3 && (
                    <p className="text-xs text-gray-500">+{thisWeekDecisionsLocked.length - 3} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No decisions locked this week</p>
              )}
            </div>

            {/* Priorities Progress */}
            <div className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Priority Progress</h3>
              {totalPriorities > 0 ? (
                <>
                  <div className="text-3xl font-bold text-white mb-2">
                    {completedPriorities}/{totalPriorities}
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full ${completedPriorities === totalPriorities ? 'bg-green-500' : 'bg-accent'}`}
                      style={{ width: `${(completedPriorities / totalPriorities) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {completedPriorities === totalPriorities 
                      ? "All priorities completed! 🎉" 
                      : `${totalPriorities - completedPriorities} remaining`}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">No priorities set this week</p>
              )}
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Captures" value={thisWeekCaptures.length} icon={Target} />
            <StatCard label="Decisions Locked" value={thisWeekDecisionsLocked.length} icon={CheckCircle2} />
            <StatCard 
              label="Status" 
              value={defaultAliveStatus === 'alive' ? 'Alive' : defaultAliveStatus === 'dead' ? 'At Risk' : 'Uncertain'} 
              icon={defaultAliveStatus === 'alive' ? TrendingUp : AlertTriangle}
              highlight={defaultAliveStatus !== 'alive'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0F1729] shrink-0">
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate("/reviews")} 
              className="flex-1 border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            >
              View Full Review
            </Button>
            <Button 
              onClick={() => navigate("/ritual")} 
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              Start Next Week <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AllocationItemProps {
  label: string;
  percent: number;
  color: string;
  warning?: boolean;
  highlight?: boolean;
}

const AllocationItem = ({ label, percent, color, warning, highlight }: AllocationItemProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-sm">
      <span className={`${warning ? 'text-orange-400' : highlight ? 'text-green-400' : 'text-gray-300'}`}>
        {label}
      </span>
      <span className={`font-bold ${warning ? 'text-orange-400' : highlight ? 'text-green-400' : 'text-white'}`}>
        {percent}%
      </span>
    </div>
    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${percent}%` }} 
      />
    </div>
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  highlight?: boolean;
}

const StatCard = ({ label, value, icon: Icon, highlight }: StatCardProps) => (
  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 text-center">
    <Icon className={`h-5 w-5 mx-auto mb-2 ${highlight ? 'text-orange-400' : 'text-gray-400'}`} />
    <div className={`text-2xl font-bold ${highlight ? 'text-orange-400' : 'text-white'}`}>{value}</div>
    <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
  </div>
);
