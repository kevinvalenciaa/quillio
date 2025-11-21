import { format } from "date-fns";
import { Activity } from "lucide-react";

export const TimelineHeader = ({ count = 0 }: { count?: number }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">Today</h2>
        <p className="text-sm text-white/60">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
        <Activity className="h-3 w-3 text-blue-500" />
        <span className="text-xs font-medium text-white/80">{count} entries</span>
      </div>
    </div>
  );
};

