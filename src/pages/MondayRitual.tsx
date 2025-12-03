import { useState } from "react";
import { ArrowRight, ArrowLeft, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

export default function MondayRitual() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else navigate("/"); // Go back to dashboard
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8">
       <div className="bg-[#0F1729] w-full max-w-5xl h-full max-h-[900px] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
          {/* Header */}
          <div className="px-8 sm:px-12 py-8 border-b border-white/10 flex items-start justify-between bg-[#0F1729] shrink-0">
             <div>
                <h1 className="text-3xl sm:text-4xl font-serif text-white mb-2">Your Weekly Ritual</h1>
                <p className="text-gray-400 text-base sm:text-lg">30 minutes to set intentions and break decision loops</p>
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
              <TabItem active={step === 1} label="Decisions" onClick={() => setStep(1)} />
              <TabItem active={step === 2} label="Priorities" onClick={() => setStep(2)} />
              <TabItem active={step === 3} label="Execution" onClick={() => setStep(3)} />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-[#0F1729] scroll-smooth">
             {step === 1 && <StepDecisions />}
             {step === 2 && <StepPriorities />}
             {step === 3 && <StepExecution />}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 flex items-center justify-between bg-[#0F1729] shrink-0">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={step === 1}
                className="text-gray-400 hover:text-white text-base disabled:opacity-30"
              >
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handleNext} 
                className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-accent/20 transition-all hover:scale-105"
              >
                 {step === totalSteps ? 'Complete Ritual' : 'Next Step'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </div>
       </div>
    </div>
  );
}

const TabItem = ({ active, label, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`pb-2 border-b-2 transition-all duration-300 ${active ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
    >
        {label}
    </button>
)

const StepDecisions = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="mb-10">
            <h2 className="text-3xl font-serif text-white mb-2">Forced Decisions</h2>
            <p className="text-gray-400">These decisions have been looping. Time to commit.</p>
        </div>

        <div className="space-y-8">
            <DecisionItem 
                title="Pricing Model: Usage-based vs. Flat-fee"
                context="Mentioned 3 times over 4 days"
            />
            <DecisionItem 
                title="Hiring Timeline for Senior Eng"
                context="Mentioned 2 times over 2 days"
            />
        </div>
    </div>
)

const DecisionItem = ({ title, context }: any) => (
    <div className="bg-white/[0.02] border-l-4 border-accent rounded-r-xl p-8 hover:bg-white/[0.04] transition-colors">
        <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{context}</p>
        </div>
        
        <div className="space-y-6">
            <RadioGroup defaultValue="option-one">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="option-one" id="option-one" className="border-white/30 text-accent" />
                    <Label htmlFor="option-one" className="text-white cursor-pointer flex-1">Usage-based pricing ($0.10 per capture)</Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="option-two" id="option-two" className="border-white/30 text-accent" />
                    <Label htmlFor="option-two" className="text-white cursor-pointer flex-1">Flat-fee $30/month</Label>
                </div>
            </RadioGroup>

            <div className="space-y-4">
                <div>
                    <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider font-bold">Reasoning</Label>
                    <Textarea placeholder="Why this option?" className="bg-black/20 border-white/10 h-24 text-white focus-visible:ring-accent" />
                </div>
                <div>
                    <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider font-bold">Next Step</Label>
                    <Textarea placeholder="What happens now?" className="bg-black/20 border-white/10 h-20 text-white focus-visible:ring-accent" />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20">Lock Decision</Button>
            </div>
        </div>
    </div>
)

const StepPriorities = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="mb-10">
            <h2 className="text-3xl font-serif text-white mb-2">Set Your Top 3</h2>
            <p className="text-gray-400">What matters most this week?</p>
        </div>

        <div className="space-y-6">
            <PriorityInput 
                label="Business Priority" 
                placeholder="e.g., Ship onboarding flow, Close 2 pilot customers"
            />
            <PriorityInput 
                label="Leadership Action" 
                placeholder="e.g., 1:1 with Sarah, Team retrospective"
            />
            <PriorityInput 
                label="Personal Goal" 
                placeholder="e.g., 3 days without responding after hours, Sleep 8 hours"
            />
        </div>
    </div>
)

const PriorityInput = ({ label, placeholder }: any) => (
    <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
        <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-bold text-gray-300 uppercase tracking-wide">{label}</Label>
            <div className="text-xs text-gray-500">Importance</div>
        </div>
        <Textarea 
            placeholder={placeholder} 
            className="bg-black/20 border-white/10 h-24 text-lg mb-6 text-white focus-visible:ring-accent" 
        />
        <div className="flex items-center gap-4">
             <span className="text-xs text-gray-500 font-medium">Low</span>
             <Slider defaultValue={[75]} max={100} step={1} className="flex-1" />
             <span className="text-xs text-gray-500 font-medium">High</span>
        </div>
    </div>
)

const StepExecution = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="mb-10">
            <h2 className="text-3xl font-serif text-white mb-2">Execution Commitment</h2>
            <p className="text-gray-400">Block time for what matters.</p>
        </div>

        <div className="space-y-6 mb-8">
            <div className="p-6 bg-white/5 rounded-xl border-l-4 border-accent">
                <h3 className="font-medium text-white mb-4 text-lg">When will you work on: <span className="text-accent">Ship onboarding flow</span>?</h3>
                <div className="grid grid-cols-5 gap-3 mb-6">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                        <div key={day} className="text-center p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 border border-white/5 transition-colors group">
                            <div className="text-xs text-gray-500 mb-2 group-hover:text-gray-300">{day}</div>
                            <div className="text-sm font-medium text-white group-hover:text-accent">--</div>
                        </div>
                    ))}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2 bg-white/5 p-3 rounded-lg w-fit">
                    <CalendarIcon className="h-4 w-4 text-accent" />
                    Suggested: <span className="text-white font-medium">Tuesday 10am-12pm</span>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex flex-col gap-1">
                <span className="font-medium text-white">Slack Integration</span>
                <span className="text-sm text-gray-400">Auto-decline Slack messages during focus blocks</span>
            </div>
            <Switch defaultChecked />
        </div>
    </div>
)

