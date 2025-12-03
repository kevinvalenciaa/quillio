import { X, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function FridayRecap() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
       <div className="bg-[#0F1729] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-[#0F1729] shrink-0">
             <h1 className="text-2xl font-serif text-white tracking-tight">Week Recap</h1>
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => navigate("/")}>
                <X className="h-5 w-5 text-gray-400" />
             </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#0F1729] space-y-8">
             
             {/* 4a: Time Allocation */}
             <div className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-2">How You Actually Spent Your Time</h2>
                <div className="space-y-4">
                    <AllocationItem label="Operational tasks" percent={70} color="bg-red-500" />
                    <AllocationItem label="Strategic" percent={15} color="bg-gray-500" />
                    <AllocationItem label="Sales/Growth" percent={8} color="bg-accent" />
                    <AllocationItem label="Admin" percent={7} color="bg-gray-700" />
                </div>
                <p className="text-sm text-gray-400 mt-4 italic border-l-2 border-white/20 pl-4 py-1">
                    "Your top priority was 'Ship onboarding', but you spent only 8% on it."
                </p>
             </div>

             {/* 4b: Runway Reality Check */}
             <div className="bg-white/[0.03] rounded-xl p-6 border border-white/5">
                 <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" /> Runway Reality Check
                 </h2>
                 <div className="grid grid-cols-3 gap-6 mb-6">
                     <div>
                         <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Burn Rate</div>
                         <div className="text-xl font-bold text-white">$8,500/mo</div>
                     </div>
                     <div>
                         <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Revenue</div>
                         <div className="text-xl font-bold text-white">$200</div>
                     </div>
                     <div>
                         <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Runway</div>
                         <div className="text-2xl font-bold text-accent font-serif">45 days</div>
                     </div>
                 </div>
                 <div className="text-sm text-gray-300 bg-black/20 p-4 rounded-lg leading-relaxed border border-white/5">
                    At current allocation, you're spending <span className="text-white font-bold">70% on ops</span> and only <span className="text-white font-bold">8% on growth</span>. If you shift 10% toward sales: runway extends 2 weeks to 59 days.
                 </div>
             </div>

             {/* 4c: Decision Execution */}
             <div>
                 <h2 className="text-lg font-bold text-white mb-4">Decisions Made This Week</h2>
                 <div className="space-y-3">
                     <DecisionItem text="Pricing Model: Usage-based ($0.10 per capture)" status="done" />
                     <DecisionItem text="Hire Senior Engineer: Target Jan 15" status="in_progress" />
                 </div>
             </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-[#0F1729] shrink-0">
              <Button onClick={() => navigate("/")} className="w-full bg-white/10 hover:bg-white/20 text-white h-12 text-base font-medium transition-colors">
                 Review Your Week in Detail
              </Button>
              <div className="text-center mt-3 text-xs text-gray-500">See full breakdown and historical trends</div>
          </div>
       </div>
    </div>
  );
}

const AllocationItem = ({ label, percent, color }: any) => (
    <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
            <span className="text-gray-300">{label}</span>
            <span className="font-bold text-white">{percent}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
        </div>
    </div>
)

const DecisionItem = ({ text, status }: any) => (
    <div className="flex items-center gap-3 text-sm p-3 rounded-lg hover:bg-white/5 transition-colors">
        {status === 'done' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        ) : (
            <Clock className="h-5 w-5 text-orange-500 shrink-0" />
        )}
        <span className={`truncate ${status === 'done' ? 'text-gray-400 line-through decoration-gray-600' : 'text-white'}`}>{text}</span>
        <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider shrink-0 px-2 py-0.5 rounded ${status === 'done' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
            {status === 'done' ? 'Done' : 'In Progress'}
        </span>
    </div>
)

