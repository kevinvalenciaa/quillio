import { useState } from "react";
import { DollarSign, TrendingUp, Users, Target, Calculator, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { FounderContext } from "@/types/journal";

interface FounderContextFormProps {
  onComplete?: () => void;
  showTitle?: boolean;
  compact?: boolean;
}

const defaultContext: FounderContext = {
  cashReserves: 0,
  monthlyBurnRate: 0,
  monthlyRevenue: 0,
  runway: 0,
  weeklyGrowthRate: 0,
  weeklyGrowthTarget: 5,
  teamSize: 1,
  quarterlyGoals: [],
  defaultAliveStatus: 'uncertain',
  lastUpdated: Date.now(),
  dataSource: 'manual',
};

export function FounderContextForm({ onComplete, showTitle = true, compact = false }: FounderContextFormProps) {
  const [context, setContext] = useLocalStorage<FounderContext>('quillio-founder-context', defaultContext);
  const [goalsText, setGoalsText] = useState(context.quarterlyGoals.join('\n'));

  // Calculate runway from inputs
  const calculateRunway = (cash: number, burn: number, revenue: number): number => {
    const netBurn = burn - revenue;
    if (netBurn <= 0) return 365; // Default alive
    return Math.round(cash / netBurn * 30); // Days
  };

  // Calculate default alive status
  const getAliveStatus = (runway: number, growthRate: number, targetRate: number): 'alive' | 'dead' | 'uncertain' => {
    if (runway > 180) return 'alive';
    if (runway < 60 && growthRate < targetRate * 0.5) return 'dead';
    return 'uncertain';
  };

  const handleChange = (field: keyof FounderContext, value: number | string) => {
    const newContext = { ...context, [field]: value, lastUpdated: Date.now() };
    
    // Recalculate runway
    const runway = calculateRunway(
      field === 'cashReserves' ? Number(value) : context.cashReserves,
      field === 'monthlyBurnRate' ? Number(value) : context.monthlyBurnRate,
      field === 'monthlyRevenue' ? Number(value) : context.monthlyRevenue
    );
    newContext.runway = runway;
    
    // Recalculate alive status
    newContext.defaultAliveStatus = getAliveStatus(
      runway,
      field === 'weeklyGrowthRate' ? Number(value) : context.weeklyGrowthRate,
      field === 'weeklyGrowthTarget' ? Number(value) : context.weeklyGrowthTarget
    );
    
    setContext(newContext);
  };

  const handleGoalsChange = (text: string) => {
    setGoalsText(text);
    const goals = text.split('\n').filter(g => g.trim());
    setContext({ ...context, quarterlyGoals: goals, lastUpdated: Date.now() });
  };

  const handleSave = () => {
    onComplete?.();
  };

  const runway = calculateRunway(context.cashReserves, context.monthlyBurnRate, context.monthlyRevenue);
  const netBurn = context.monthlyBurnRate - context.monthlyRevenue;
  const aliveStatus = getAliveStatus(runway, context.weeklyGrowthRate, context.weeklyGrowthTarget);

  return (
    <div className={compact ? 'space-y-6' : 'space-y-8'}>
      {showTitle && (
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-white mb-2">Founder Context</h2>
          <p className="text-gray-400">This helps us prioritize what matters and calculate your runway math.</p>
        </div>
      )}

      {/* Runway Status Card */}
      <div className={`p-6 rounded-xl border-l-4 ${
        aliveStatus === 'alive' ? 'bg-green-500/5 border-green-500' :
        aliveStatus === 'dead' ? 'bg-red-500/5 border-red-500' :
        'bg-orange-500/5 border-orange-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {aliveStatus === 'alive' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
               aliveStatus === 'dead' ? <AlertTriangle className="h-5 w-5 text-red-500" /> :
               <Calculator className="h-5 w-5 text-orange-500" />}
              <span className={`text-sm font-bold uppercase tracking-wider ${
                aliveStatus === 'alive' ? 'text-green-500' :
                aliveStatus === 'dead' ? 'text-red-500' : 'text-orange-500'
              }`}>
                Default {aliveStatus}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {runway > 0 ? (
                <span>At current burn, you have <span className="text-white font-bold">{runway} days</span> of runway</span>
              ) : (
                <span>Enter your financials to calculate runway</span>
              )}
            </div>
          </div>
          <div className={`text-4xl font-serif font-bold ${
            aliveStatus === 'alive' ? 'text-green-500' :
            aliveStatus === 'dead' ? 'text-red-500' : 'text-orange-500'
          }`}>
            {runway > 0 ? `${runway}d` : '--'}
          </div>
        </div>
      </div>

      {/* Financial Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <DollarSign className="h-3 w-3" /> Cash Reserves
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input 
              type="number"
              placeholder="500000"
              value={context.cashReserves || ''}
              onChange={(e) => handleChange('cashReserves', Number(e.target.value))}
              className="pl-7 bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
            />
          </div>
          <p className="text-xs text-gray-500">Total cash in bank</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <TrendingUp className="h-3 w-3 rotate-180" /> Monthly Burn Rate
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input 
              type="number"
              placeholder="40000"
              value={context.monthlyBurnRate || ''}
              onChange={(e) => handleChange('monthlyBurnRate', Number(e.target.value))}
              className="pl-7 bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
            />
          </div>
          <p className="text-xs text-gray-500">Total monthly expenses</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" /> Monthly Revenue
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input 
              type="number"
              placeholder="8000"
              value={context.monthlyRevenue || ''}
              onChange={(e) => handleChange('monthlyRevenue', Number(e.target.value))}
              className="pl-7 bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
            />
          </div>
          <p className="text-xs text-gray-500">Current MRR / ARR ÷ 12</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <Users className="h-3 w-3" /> Team Size
          </Label>
          <Input 
            type="number"
            placeholder="8"
            value={context.teamSize || ''}
            onChange={(e) => handleChange('teamSize', Number(e.target.value))}
            className="bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
          />
          <p className="text-xs text-gray-500">Full-time team members</p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" /> Weekly Growth Rate
          </Label>
          <div className="relative">
            <Input 
              type="number"
              step="0.1"
              placeholder="3.2"
              value={context.weeklyGrowthRate || ''}
              onChange={(e) => handleChange('weeklyGrowthRate', Number(e.target.value))}
              className="pr-8 bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500">Current weekly growth</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <Target className="h-3 w-3" /> Growth Target
          </Label>
          <div className="relative">
            <Input 
              type="number"
              step="0.1"
              placeholder="5"
              value={context.weeklyGrowthTarget || ''}
              onChange={(e) => handleChange('weeklyGrowthTarget', Number(e.target.value))}
              className="pr-8 bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500">Target weekly growth (5-7% typical)</p>
        </div>
      </div>

      {/* Quarterly Goals */}
      {!compact && (
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <Target className="h-3 w-3" /> Top 3 Quarterly Goals
          </Label>
          <Textarea 
            placeholder="One goal per line, e.g.:&#10;Hit $10k MRR&#10;Close 5 pilot customers&#10;Ship v1 of mobile app"
            value={goalsText}
            onChange={(e) => handleGoalsChange(e.target.value)}
            className="min-h-[100px] bg-[#1F2D47]/60 border-white/10 focus-visible:ring-accent"
          />
          <p className="text-xs text-gray-500">These inform priority suggestions during your Monday ritual</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center p-4 bg-white/[0.02] rounded-lg">
          <div className="text-2xl font-serif text-white">${Math.round(netBurn / 1000)}k</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Net Burn/mo</div>
        </div>
        <div className="text-center p-4 bg-white/[0.02] rounded-lg">
          <div className={`text-2xl font-serif ${runway < 90 ? 'text-red-400' : runway < 180 ? 'text-orange-400' : 'text-green-400'}`}>
            {runway > 0 ? runway : '--'}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Days Runway</div>
        </div>
        <div className="text-center p-4 bg-white/[0.02] rounded-lg">
          <div className={`text-2xl font-serif ${context.weeklyGrowthRate >= context.weeklyGrowthTarget ? 'text-green-400' : 'text-orange-400'}`}>
            {context.weeklyGrowthRate || '--'}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Weekly Growth</div>
        </div>
      </div>

      {onComplete && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white px-8 gap-2">
            Save Context <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

