import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, PenTool, Slack, Calendar, Database, CreditCard } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      burnRate: '',
      revenue: '',
      growthTarget: '',
      teamSize: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleComplete = () => navigate('/');

  return (
    <div className="min-h-screen w-full bg-[#0F1729] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F1729] to-[#1a243a] -z-10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#C17A72]/10 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-2xl z-10">
            
            {/* Step 1: Welcome */}
            {step === 1 && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/5 mb-10 shadow-2xl border border-white/10">
                        <span className="text-4xl font-serif text-white">Q</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-serif mb-6 tracking-tight">Welcome to Quillio</h1>
                    <p className="text-xl text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">Your thinking partner for clarity and execution.</p>
                    <Button onClick={handleNext} className="bg-accent hover:bg-accent/90 text-white h-14 px-10 text-lg rounded-2xl shadow-lg shadow-accent/20 transition-transform hover:scale-105">
                        Let's get started
                    </Button>
                </div>
            )}

            {/* Step 2: Connect Tools */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-serif mb-3 text-center">Connect Your Tools</h2>
                    <p className="text-gray-400 text-center mb-10">We'll pull context to make recommendations smarter.</p>
                    
                    <div className="space-y-4 mb-10">
                        <ToolItem icon={Slack} name="Slack" recommended />
                        <ToolItem icon={Calendar} name="Google Calendar" recommended />
                        <ToolItem icon={Database} name="Linear or Notion" />
                        <ToolItem icon={CreditCard} name="Stripe" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button onClick={handleNext} className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base rounded-xl shadow-md">
                            Continue
                        </Button>
                        <Button variant="ghost" onClick={handleNext} className="text-gray-500 hover:text-white">
                            Skip for now, I'll set this up later
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Set Initial Context */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-serif mb-3 text-center">Tell Us About Your Business</h2>
                    <p className="text-gray-400 text-center mb-10">This helps us prioritize what matters most.</p>
                    
                    <div className="space-y-6 mb-10 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Burn Rate</Label>
                                <Input placeholder="$0" className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" value={formData.burnRate} onChange={e => setFormData({...formData, burnRate: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Revenue</Label>
                                <Input placeholder="$0" className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Target Growth Rate (Weekly)</Label>
                            <Input placeholder="5%" className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" value={formData.growthTarget} onChange={e => setFormData({...formData, growthTarget: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Team Size</Label>
                            <Input placeholder="e.g. 8" className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} />
                        </div>
                    </div>

                    <Button onClick={handleNext} className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base rounded-xl shadow-md">
                        Continue
                    </Button>
                </div>
            )}

            {/* Step 4: First Capture */}
            {step === 4 && (
                <div className="text-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-serif mb-4">Try Your First Capture</h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto">What's a decision you've been looping on? What context matters?</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <Button variant="outline" className="h-48 flex flex-col items-center justify-center gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent hover:text-accent transition-all group rounded-3xl" onClick={handleComplete}>
                            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors group-hover:scale-110 duration-300">
                                <Mic className="h-8 w-8" />
                            </div>
                            <span className="text-lg font-medium">Voice Note</span>
                        </Button>
                        <Button variant="outline" className="h-48 flex flex-col items-center justify-center gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent hover:text-accent transition-all group rounded-3xl" onClick={handleComplete}>
                             <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors group-hover:scale-110 duration-300">
                                <PenTool className="h-8 w-8" />
                            </div>
                            <span className="text-lg font-medium">Type</span>
                        </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500">Great! This will be processed overnight and inform your Monday ritual.</p>
                </div>
            )}

            {/* Step Indicators */}
            <div className="fixed bottom-8 left-0 w-full flex justify-center gap-2 pointer-events-none">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${step === s ? 'w-8 bg-accent' : 'w-2 bg-white/10'}`} />
                ))}
            </div>
        </div>
    </div>
  );
}

const ToolItem = ({ icon: Icon, name, recommended }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors border border-white/5">
                <Icon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-left">
                <div className="font-medium text-white text-lg">{name}</div>
                {recommended && <div className="text-xs text-accent font-medium mt-0.5">Recommended</div>}
            </div>
        </div>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10 font-medium">Connect</Button>
    </div>
)
