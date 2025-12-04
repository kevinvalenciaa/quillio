import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, X, Calendar as CalendarIcon, AlertCircle, Check, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAppData, type Decision, type Priority } from "@/context/AppDataContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface DecisionAction {
  id: string;
  action: 'lock' | 'defer' | 'dismiss' | null;
  selectedOption?: string;
  reasoning?: string;
  nextStep?: string;
  deferUntil?: string;
}

interface PriorityDraft {
  content: string;
  category: 'business' | 'leadership' | 'personal';
  importance: number;
  allocatedTime: number;
}

export default function MondayRitual() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    activeLoops, 
    captures, 
    founderContext,
    lockDecision, 
    deferDecision, 
    setPriorities,
    loading 
  } = useAppData();

  // Track decision actions
  const [decisionActions, setDecisionActions] = useState<DecisionAction[]>([]);
  
  // Track priority drafts
  const [priorityDrafts, setPriorityDrafts] = useState<PriorityDraft[]>([
    { content: '', category: 'business', importance: 75, allocatedTime: 40 },
    { content: '', category: 'leadership', importance: 50, allocatedTime: 30 },
    { content: '', category: 'personal', importance: 50, allocatedTime: 30 },
  ]);

  // Track execution settings
  const [slackIntegration, setSlackIntegration] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize decision actions when activeLoops change
  useEffect(() => {
    if (activeLoops.length > 0) {
      setDecisionActions(activeLoops.map(d => ({
        id: d.id,
        action: null,
      })));
    }
  }, [activeLoops]);

  // Get this week's captures for context
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekCaptures = captures.filter(c => 
    isWithinInterval(new Date(c.timestamp), { start: weekStart, end: weekEnd })
  );

  // Check if all decisions have been addressed
  const allDecisionsAddressed = activeLoops.length === 0 || 
    decisionActions.every(da => da.action !== null);

  // Check if priorities are valid
  const prioritiesValid = priorityDrafts.every(p => p.content.trim().length > 0);

  const updateDecisionAction = (id: string, updates: Partial<DecisionAction>) => {
    setDecisionActions(prev => prev.map(da => 
      da.id === id ? { ...da, ...updates } : da
    ));
  };

  const handleNext = async () => {
    if (step === 1 && !allDecisionsAddressed) {
      toast({
        title: "Address all decisions",
        description: "You must decide, defer, or dismiss each decision loop.",
        variant: "destructive",
      });
      return;
    }

    if (step === 2 && !prioritiesValid) {
      toast({
        title: "Set all priorities",
        description: "Please enter content for all three priorities.",
        variant: "destructive",
      });
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete the ritual - save everything
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Process all decision actions
      for (const da of decisionActions) {
        if (da.action === 'lock' && da.selectedOption && da.reasoning && da.nextStep) {
          await lockDecision(da.id, da.selectedOption, da.reasoning, da.nextStep);
        } else if (da.action === 'defer' && da.deferUntil) {
          await deferDecision(da.id, new Date(da.deferUntil).getTime());
        }
        // 'dismiss' would need a dismissDecision API call
      }

      // Save priorities
      const weekOf = format(weekStart, 'yyyy-MM-dd');
      const priorities: Priority[] = priorityDrafts.map((p, i) => ({
        id: `priority-${Date.now()}-${i}`,
        content: p.content,
        category: p.category,
        importance: p.importance,
        weekOf,
        allocatedTime: p.allocatedTime,
        status: 'pending' as const,
      }));
      
      await setPriorities(priorities);

      toast({
        title: "Weekly ritual complete!",
        description: "Your decisions are locked and priorities are set.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error completing ritual",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading your data...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8">
      <div className="bg-[#0F1729] w-full max-w-5xl h-full max-h-[900px] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="px-8 sm:px-12 py-8 border-b border-white/10 flex items-start justify-between bg-[#0F1729] shrink-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-white mb-2">Your Weekly Ritual</h1>
            <p className="text-gray-400 text-base sm:text-lg">
              {format(new Date(), "EEEE, MMMM do")} • 30 minutes to set intentions
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => navigate("/")}>
              <X className="h-6 w-6 text-gray-400" />
            </Button>
            <div className="text-sm text-gray-500 font-medium">{step}/{totalSteps} sections</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 shrink-0">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 sm:px-12 py-4 border-b border-white/5 flex items-center gap-8 text-sm font-medium shrink-0 bg-[#0F1729]">
          <TabItem active={step === 1} label={`Decisions (${activeLoops.length})`} onClick={() => setStep(1)} />
          <TabItem active={step === 2} label="Priorities" onClick={() => step > 1 && setStep(2)} disabled={step < 2} />
          <TabItem active={step === 3} label="Execution" onClick={() => step > 2 && setStep(3)} disabled={step < 3} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-[#0F1729] scroll-smooth">
          {step === 1 && (
            <StepDecisions 
              decisions={activeLoops}
              decisionActions={decisionActions}
              onUpdate={updateDecisionAction}
              capturesThisWeek={thisWeekCaptures.length}
            />
          )}
          {step === 2 && (
            <StepPriorities 
              priorities={priorityDrafts}
              onUpdate={(index, updates) => {
                setPriorityDrafts(prev => prev.map((p, i) => 
                  i === index ? { ...p, ...updates } : p
                ));
              }}
              founderContext={founderContext}
            />
          )}
          {step === 3 && (
            <StepExecution 
              priorities={priorityDrafts}
              slackIntegration={slackIntegration}
              onSlackToggle={setSlackIntegration}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/10 flex items-center justify-between bg-[#0F1729] shrink-0">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1 || isSubmitting}
            className="text-gray-400 hover:text-white text-base disabled:opacity-30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-accent/20 transition-all hover:scale-105"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : step === totalSteps ? (
              <><Check className="mr-2 h-4 w-4" /> Complete Ritual</>
            ) : (
              <>Next Step <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const TabItem = ({ active, label, onClick, disabled }: { active: boolean; label: string; onClick: () => void; disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`pb-2 border-b-2 transition-all duration-300 ${
      active 
        ? 'border-accent text-white' 
        : disabled 
          ? 'border-transparent text-gray-600 cursor-not-allowed'
          : 'border-transparent text-gray-500 hover:text-gray-300'
    }`}
  >
    {label}
  </button>
);

interface StepDecisionsProps {
  decisions: Decision[];
  decisionActions: DecisionAction[];
  onUpdate: (id: string, updates: Partial<DecisionAction>) => void;
  capturesThisWeek: number;
}

const StepDecisions = ({ decisions, decisionActions, onUpdate, capturesThisWeek }: StepDecisionsProps) => (
  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
    <div className="mb-10">
      <h2 className="text-3xl font-serif text-white mb-2">Forced Decisions</h2>
      <p className="text-gray-400">
        {decisions.length > 0 
          ? "These decisions have been looping. Time to commit."
          : `No decision loops detected. You had ${capturesThisWeek} captures this week.`
        }
      </p>
    </div>

    {decisions.length === 0 ? (
      <div className="text-center py-16 bg-white/[0.02] rounded-xl border border-white/5">
        <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No decision loops!</h3>
        <p className="text-gray-400">You're keeping on top of your decisions. Continue to the next step.</p>
      </div>
    ) : (
      <div className="space-y-8">
        {decisions.map((decision) => {
          const action = decisionActions.find(da => da.id === decision.id);
          return (
            <DecisionItem 
              key={decision.id}
              decision={decision}
              action={action}
              onUpdate={(updates) => onUpdate(decision.id, updates)}
            />
          );
        })}
      </div>
    )}
  </div>
);

interface DecisionItemProps {
  decision: Decision;
  action: DecisionAction | undefined;
  onUpdate: (updates: Partial<DecisionAction>) => void;
}

const DecisionItem = ({ decision, action, onUpdate }: DecisionItemProps) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={`bg-white/[0.02] border-l-4 rounded-r-xl p-8 transition-all ${
      action?.action ? 'border-green-500 opacity-75' : 'border-accent'
    }`}>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{decision.title}</h3>
            <p className="text-sm text-gray-500">
              Mentioned {decision.mentionCount} times • First mentioned {format(new Date(decision.firstMentioned), 'MMM d')}
            </p>
          </div>
          {action?.action && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              action.action === 'lock' ? 'bg-green-500/20 text-green-400' :
              action.action === 'defer' ? 'bg-orange-500/20 text-orange-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {action.action === 'lock' ? 'Locked' : action.action === 'defer' ? 'Deferred' : 'Dismissed'}
            </div>
          )}
        </div>
      </div>
      
      {!action?.action ? (
        <div className="space-y-6">
          {/* Action Selection */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={() => {
                onUpdate({ action: 'lock' });
                setExpanded(true);
              }}
            >
              <Check className="mr-2 h-4 w-4" /> Lock It
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              onClick={() => {
                onUpdate({ action: 'defer' });
                setExpanded(true);
              }}
            >
              <Clock className="mr-2 h-4 w-4" /> Defer
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
              onClick={() => onUpdate({ action: 'dismiss' })}
            >
              <X className="mr-2 h-4 w-4" /> Dismiss
            </Button>
          </div>

          {/* Options if available */}
          {decision.options.length > 0 && (
            <RadioGroup 
              value={action?.selectedOption}
              onValueChange={(value) => onUpdate({ selectedOption: value })}
            >
              {decision.options.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                  <RadioGroupItem value={opt.label} id={opt.id} className="border-white/30 text-accent" />
                  <Label htmlFor={opt.id} className="text-white cursor-pointer flex-1">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      ) : expanded || action.action === 'lock' || action.action === 'defer' ? (
        <div className="space-y-4">
          {action.action === 'lock' && (
            <>
              <div>
                <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider font-bold">Selected Option</Label>
                <Input 
                  placeholder="What did you decide?"
                  value={action.selectedOption || ''}
                  onChange={(e) => onUpdate({ selectedOption: e.target.value })}
                  className="bg-black/20 border-white/10 text-white focus-visible:ring-accent"
                />
              </div>
              <div>
                <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider font-bold">Reasoning</Label>
                <Textarea 
                  placeholder="Why this option?"
                  value={action.reasoning || ''}
                  onChange={(e) => onUpdate({ reasoning: e.target.value })}
                  className="bg-black/20 border-white/10 h-24 text-white focus-visible:ring-accent"
                />
              </div>
              <div>
                <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider font-bold">Next Step</Label>
                <Textarea 
                  placeholder="What happens now?"
                  value={action.nextStep || ''}
                  onChange={(e) => onUpdate({ nextStep: e.target.value })}
                  className="bg-black/20 border-white/10 h-20 text-white focus-visible:ring-accent"
                />
              </div>
            </>
          )}
          {action.action === 'defer' && (
            <div>
              <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider font-bold">Defer Until</Label>
              <Input 
                type="date"
                value={action.deferUntil || ''}
                onChange={(e) => onUpdate({ deferUntil: e.target.value })}
                className="bg-black/20 border-white/10 text-white focus-visible:ring-accent"
              />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onUpdate({ action: null })}
            className="text-gray-500"
          >
            Change decision
          </Button>
        </div>
      ) : null}
    </div>
  );
};

interface StepPrioritiesProps {
  priorities: PriorityDraft[];
  onUpdate: (index: number, updates: Partial<PriorityDraft>) => void;
  founderContext: any;
}

const StepPriorities = ({ priorities, onUpdate, founderContext }: StepPrioritiesProps) => (
  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
    <div className="mb-10">
      <h2 className="text-3xl font-serif text-white mb-2">Set Your Top 3</h2>
      <p className="text-gray-400">What matters most this week? (One business, one leadership, one personal)</p>
    </div>

    {/* Context reminder */}
    {founderContext.runway > 0 && (
      <div className="mb-8 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <div className="text-sm text-white font-medium">Context: {founderContext.runway} days runway</div>
          <div className="text-xs text-gray-400">
            At ${founderContext.monthlyBurnRate.toLocaleString()}/mo burn, prioritize growth-driving activities.
          </div>
        </div>
      </div>
    )}

    <div className="space-y-6">
      {priorities.map((priority, index) => (
        <PriorityInput 
          key={index}
          label={priority.category === 'business' ? 'Business Priority' : 
                 priority.category === 'leadership' ? 'Leadership Action' : 'Personal Goal'}
          placeholder={priority.category === 'business' ? 'e.g., Ship onboarding flow, Close 2 pilot customers' :
                       priority.category === 'leadership' ? 'e.g., 1:1 with Sarah, Team retrospective' :
                       'e.g., 3 days without responding after hours'}
          value={priority.content}
          importance={priority.importance}
          allocatedTime={priority.allocatedTime}
          onChange={(content) => onUpdate(index, { content })}
          onImportanceChange={(importance) => onUpdate(index, { importance })}
          onTimeChange={(allocatedTime) => onUpdate(index, { allocatedTime })}
        />
      ))}
    </div>
  </div>
);

interface PriorityInputProps {
  label: string;
  placeholder: string;
  value: string;
  importance: number;
  allocatedTime: number;
  onChange: (value: string) => void;
  onImportanceChange: (value: number) => void;
  onTimeChange: (value: number) => void;
}

const PriorityInput = ({ label, placeholder, value, importance, allocatedTime, onChange, onImportanceChange, onTimeChange }: PriorityInputProps) => (
  <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
    <div className="flex justify-between items-center mb-3">
      <Label className="text-sm font-bold text-gray-300 uppercase tracking-wide">{label}</Label>
      <div className="text-xs text-gray-500">Importance: {importance}%</div>
    </div>
    <Textarea 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-black/20 border-white/10 h-24 text-lg mb-6 text-white focus-visible:ring-accent" 
    />
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 font-medium w-8">Low</span>
        <Slider 
          value={[importance]} 
          onValueChange={([v]) => onImportanceChange(v)}
          max={100} 
          step={5} 
          className="flex-1" 
        />
        <span className="text-xs text-gray-500 font-medium w-8">High</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Time allocation this week:</span>
        <div className="flex items-center gap-2">
          <Input 
            type="number"
            value={allocatedTime}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-16 h-8 bg-black/20 border-white/10 text-white text-center"
            min={0}
            max={100}
          />
          <span className="text-gray-500">%</span>
        </div>
      </div>
    </div>
  </div>
);

interface StepExecutionProps {
  priorities: PriorityDraft[];
  slackIntegration: boolean;
  onSlackToggle: (value: boolean) => void;
}

const StepExecution = ({ priorities, slackIntegration, onSlackToggle }: StepExecutionProps) => (
  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
    <div className="mb-10">
      <h2 className="text-3xl font-serif text-white mb-2">Execution Commitment</h2>
      <p className="text-gray-400">Review your time allocation and block focus time.</p>
    </div>

    {/* Summary of priorities */}
    <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Priorities This Week</h3>
      <div className="space-y-3">
        {priorities.filter(p => p.content.trim()).map((priority, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                priority.category === 'business' ? 'bg-accent' :
                priority.category === 'leadership' ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <span className="text-white">{priority.content}</span>
            </div>
            <span className="text-gray-500 text-sm">{priority.allocatedTime}%</span>
          </div>
        ))}
      </div>
      
      {/* Total allocation */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
        <span className="text-gray-400">Total allocated:</span>
        <span className={`font-bold ${
          priorities.reduce((sum, p) => sum + p.allocatedTime, 0) === 100 
            ? 'text-green-400' 
            : 'text-orange-400'
        }`}>
          {priorities.reduce((sum, p) => sum + p.allocatedTime, 0)}%
        </span>
      </div>
    </div>

    {/* Calendar blocking preview */}
    <div className="mb-8 p-6 bg-white/5 rounded-xl border-l-4 border-accent">
      <h3 className="font-medium text-white mb-4 text-lg flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-accent" />
        Suggested Focus Blocks
      </h3>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
          <div 
            key={day} 
            className="text-center p-4 bg-white/5 rounded-lg border border-white/5 transition-colors"
          >
            <div className="text-xs text-gray-500 mb-2">{day}</div>
            <div className="text-sm font-medium text-white">
              {i < 3 ? '9-11am' : i === 3 ? '2-4pm' : '10-12pm'}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400">
        Based on your priorities, we suggest 2 hours of focused work each day.
      </p>
    </div>

    {/* Slack integration */}
    <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-white">Slack Integration</span>
        <span className="text-sm text-gray-400">Auto-decline messages during focus blocks</span>
      </div>
      <Switch checked={slackIntegration} onCheckedChange={onSlackToggle} />
    </div>
  </div>
);
