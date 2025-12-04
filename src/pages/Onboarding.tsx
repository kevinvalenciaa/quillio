import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, 
  PenTool, 
  Slack, 
  Calendar, 
  Database, 
  CreditCard,
  Rocket,
  Briefcase,
  Palette,
  User,
  Target,
  Plus,
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/hooks/use-toast';

type UserType = 'founder' | 'executive' | 'creator' | 'freelancer' | 'other';

interface Goal {
  id: string;
  text: string;
}

const USER_TYPES = [
  { 
    id: 'founder' as UserType, 
    icon: Rocket, 
    label: 'Startup Founder', 
    description: 'Building a company, managing runway & growth',
    contextFields: ['burnRate', 'revenue', 'runway', 'teamSize', 'growthTarget'],
    suggestedGoals: [
      'Extend runway to 18+ months',
      'Achieve product-market fit',
      'Hit $10k MRR',
    ]
  },
  { 
    id: 'executive' as UserType, 
    icon: Briefcase, 
    label: 'Executive / Manager', 
    description: 'Leading teams, hitting KPIs, strategic planning',
    contextFields: ['teamSize', 'quarterlyGoals', 'budget'],
    suggestedGoals: [
      'Hit quarterly revenue targets',
      'Improve team velocity by 20%',
      'Launch key initiative on time',
    ]
  },
  { 
    id: 'creator' as UserType, 
    icon: Palette, 
    label: 'Creator / Solopreneur', 
    description: 'Content, products, audience growth',
    contextFields: ['revenue', 'audienceSize', 'contentGoals'],
    suggestedGoals: [
      'Grow audience to 10k followers',
      'Launch new product/course',
      'Consistent content schedule (3x/week)',
    ]
  },
  { 
    id: 'freelancer' as UserType, 
    icon: User, 
    label: 'Freelancer / Consultant', 
    description: 'Client work, income goals, time management',
    contextFields: ['monthlyIncome', 'hourlyRate', 'clientCount'],
    suggestedGoals: [
      'Hit $10k/month income',
      'Land 2 retainer clients',
      'Reduce admin time to 5hrs/week',
    ]
  },
  { 
    id: 'other' as UserType, 
    icon: Target, 
    label: 'Other', 
    description: 'Custom goals and metrics',
    contextFields: ['customGoals'],
    suggestedGoals: [
      'Define my top priority',
      'Build a consistent routine',
      'Track progress weekly',
    ]
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setFounderContext } = useAppData();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
  ]);
  const [newGoal, setNewGoal] = useState('');
  
  // Context form data
  const [contextData, setContextData] = useState({
    // Founder fields
    cashReserves: '',
    burnRate: '',
    revenue: '',
    growthTarget: '5',
    teamSize: '',
    // Executive fields
    budget: '',
    // Creator fields
    audienceSize: '',
    // Freelancer fields
    monthlyIncome: '',
    hourlyRate: '',
    clientCount: '',
  });

  const handleNext = () => setStep(step + 1);
  
  // Auto-fill goals when user type is selected
  const handleSelectUserType = (type: UserType) => {
    setUserType(type);
    
    // Find the suggested goals for this type
    const selectedType = USER_TYPES.find(t => t.id === type);
    if (selectedType?.suggestedGoals) {
      setGoals(selectedType.suggestedGoals.map((text, i) => ({
        id: (i + 1).toString(),
        text,
      })));
    }
  };
  
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals.filter(g => g.text), { id: Date.now().toString(), text: newGoal.trim() }]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleUpdateGoal = (id: string, text: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, text } : g));
  };

  const handleSaveAndComplete = async () => {
    try {
      // Save context based on user type
      const filteredGoals = goals.filter(g => g.text.trim()).map(g => g.text);
      
      await setFounderContext({
        cashReserves: Number(contextData.cashReserves) || 0,
        monthlyBurnRate: Number(contextData.burnRate) || 0,
        monthlyRevenue: Number(contextData.revenue) || 0,
        weeklyGrowthRate: 0,
        weeklyGrowthTarget: Number(contextData.growthTarget) || 5,
        teamSize: Number(contextData.teamSize) || 1,
        quarterlyGoals: filteredGoals,
        dataSource: 'manual',
      });

      // Store user type in localStorage for now (could be in Supabase profile)
      localStorage.setItem('quillio-user-type', userType || 'other');
      
      toast({
        title: "Welcome to Quillio!",
        description: "Your profile has been set up.",
      });
      
    navigate('/');
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedUserType = USER_TYPES.find(t => t.id === userType);

  return (
    <div className="min-h-screen w-full bg-[#0F1729] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F1729] to-[#1a243a] -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#C17A72]/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-2xl z-10">
        
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-center gap-4 mb-10">
              <img src="/white-quillio.png" alt="Quillio" className="h-14 w-auto" />
              <span className="text-4xl font-serif font-semibold">Quillio</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-serif mb-6 tracking-tight">Welcome</h1>
            <p className="text-xl text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">
              Your thinking partner for clarity and execution.
            </p>
            <Button 
              onClick={handleNext} 
              className="bg-accent hover:bg-accent/90 text-white h-14 px-10 text-lg rounded-2xl shadow-lg shadow-accent/20 transition-transform hover:scale-105"
            >
              Let's get started
      </Button>
          </div>
        )}

        {/* Step 2: Choose User Type */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-serif mb-3 text-center">What describes you best?</h2>
            <p className="text-gray-400 text-center mb-10">This helps us tailor your experience.</p>
            
            <div className="space-y-3 mb-10">
              {USER_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectUserType(type.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    userType === type.id 
                      ? 'bg-accent/10 border-accent text-white' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    userType === type.id ? 'bg-accent/20' : 'bg-white/5'
                  }`}>
                    <type.icon className={`h-6 w-6 ${userType === type.id ? 'text-accent' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-lg">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                  {userType === type.id && (
                    <Check className="h-5 w-5 text-accent" />
                  )}
                </button>
              ))}
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!userType}
              className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base rounded-xl shadow-md disabled:opacity-50"
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 3: Set Goals */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-serif mb-3 text-center">What are your top goals?</h2>
            <p className="text-gray-400 text-center mb-10">
              These will help Quillio surface what matters most.
            </p>
            
            <div className="space-y-4 mb-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              {goals.map((goal, index) => (
                <div key={goal.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <Input
                    value={goal.text}
                    onChange={(e) => handleUpdateGoal(goal.id, e.target.value)}
                    placeholder={`Goal ${index + 1}...`}
                    className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent"
                  />
                  {goals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-400 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {goals.length < 5 && (
                <Button
                  variant="ghost"
                  onClick={() => setGoals([...goals, { id: Date.now().toString(), text: '' }])}
                  className="w-full h-11 border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add another goal
                </Button>
              )}
      </div>

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-white"
              >
                Back
      </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1 bg-accent hover:bg-accent/90 text-white h-12 text-base rounded-xl shadow-md"
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Context (based on user type) */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-serif mb-3 text-center">
              {userType === 'founder' ? 'Your Startup Context' :
               userType === 'executive' ? 'Your Team Context' :
               userType === 'creator' ? 'Your Creator Context' :
               userType === 'freelancer' ? 'Your Business Context' :
               'Your Context'}
            </h2>
            <p className="text-gray-400 text-center mb-10">
              {userType === 'founder' ? 'This helps track runway and growth metrics.' :
               userType === 'executive' ? 'This helps align with your team goals.' :
               userType === 'creator' ? 'This helps track your creative goals.' :
               userType === 'freelancer' ? 'This helps manage your client work.' :
               'Optional context for your goals.'}
            </p>
            
            <div className="space-y-6 mb-10 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
              {/* Founder Fields */}
              {userType === 'founder' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Cash Reserves</Label>
                      <Input 
                        type="number"
                        placeholder="$500,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.cashReserves} 
                        onChange={e => setContextData({...contextData, cashReserves: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Burn Rate</Label>
                      <Input 
                        type="number"
                        placeholder="$40,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.burnRate} 
                        onChange={e => setContextData({...contextData, burnRate: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Revenue</Label>
                      <Input 
                        type="number"
                        placeholder="$8,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.revenue} 
                        onChange={e => setContextData({...contextData, revenue: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Team Size</Label>
                      <Input 
                        type="number"
                        placeholder="8" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.teamSize} 
                        onChange={e => setContextData({...contextData, teamSize: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Weekly Growth Target (%)</Label>
                    <Input 
                      type="number"
                      placeholder="5" 
                      className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                      value={contextData.growthTarget} 
                      onChange={e => setContextData({...contextData, growthTarget: e.target.value})} 
                    />
                  </div>
                </>
              )}

              {/* Executive Fields */}
              {userType === 'executive' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Team Size</Label>
                      <Input 
                        type="number"
                        placeholder="15" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.teamSize} 
                        onChange={e => setContextData({...contextData, teamSize: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Quarterly Budget</Label>
                      <Input 
                        type="number"
                        placeholder="$250,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.budget} 
                        onChange={e => setContextData({...contextData, budget: e.target.value})} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Creator Fields */}
              {userType === 'creator' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Revenue</Label>
                      <Input 
                        type="number"
                        placeholder="$5,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.revenue} 
                        onChange={e => setContextData({...contextData, revenue: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Audience Size</Label>
                      <Input 
                        type="number"
                        placeholder="10,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.audienceSize} 
                        onChange={e => setContextData({...contextData, audienceSize: e.target.value})} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Freelancer Fields */}
              {userType === 'freelancer' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Income Target</Label>
                      <Input 
                        type="number"
                        placeholder="$10,000" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.monthlyIncome} 
                        onChange={e => setContextData({...contextData, monthlyIncome: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Hourly Rate</Label>
                      <Input 
                        type="number"
                        placeholder="$150" 
                        className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                        value={contextData.hourlyRate} 
                        onChange={e => setContextData({...contextData, hourlyRate: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Active Clients</Label>
                    <Input 
                      type="number"
                      placeholder="5" 
                      className="bg-black/20 border-white/10 h-11 focus-visible:ring-accent" 
                      value={contextData.clientCount} 
                      onChange={e => setContextData({...contextData, clientCount: e.target.value})} 
                    />
                  </div>
                </>
              )}

              {/* Other - just show goals summary */}
              {userType === 'other' && (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">You can always add more context later in Settings.</p>
                  <div className="text-left bg-black/20 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Your Goals:</div>
                    {goals.filter(g => g.text.trim()).map((goal, i) => (
                      <div key={goal.id} className="text-sm text-gray-300 mb-1">
                        {i + 1}. {goal.text}
                      </div>
        ))}
      </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setStep(3)}
                className="text-gray-400 hover:text-white"
              >
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1 bg-accent hover:bg-accent/90 text-white h-12 text-base rounded-xl shadow-md"
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
            </div>
          </div>
        )}

        {/* Step 5: First Capture */}
        {step === 5 && (
          <div className="text-center animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-500/20 mb-8">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-serif mb-4">You're all set!</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto">
              Ready to capture your first thought?
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-12">
              <Button 
                variant="outline" 
                className="h-48 flex flex-col items-center justify-center gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent hover:text-accent transition-all group rounded-3xl" 
                onClick={handleSaveAndComplete}
          >
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors group-hover:scale-110 duration-300">
                  <Mic className="h-8 w-8" />
                </div>
                <span className="text-lg font-medium">Voice Note</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-48 flex flex-col items-center justify-center gap-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent hover:text-accent transition-all group rounded-3xl" 
                onClick={handleSaveAndComplete}
              >
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors group-hover:scale-110 duration-300">
                  <PenTool className="h-8 w-8" />
              </div>
                <span className="text-lg font-medium">Type</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleSaveAndComplete}
              className="text-gray-500 hover:text-white"
            >
              Skip for now, go to Dashboard
            </Button>
          </div>
        )}

        {/* Step Indicators */}
        <div className="fixed bottom-8 left-0 w-full flex justify-center gap-2 pointer-events-none">
          {[1, 2, 3, 4, 5].map(s => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                step === s ? 'w-8 bg-accent' : step > s ? 'w-2 bg-accent/50' : 'w-2 bg-white/10'
              }`} 
            />
        ))}
        </div>
      </div>
    </div>
  );
}
