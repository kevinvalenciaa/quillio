import { NavLink } from "react-router-dom";
import { LayoutDashboard, PenTool, Calendar, Database, Settings, Feather } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  return (
    <div className="flex h-full w-[240px] flex-col border-r border-white/10 bg-[#0F1729] text-white">
      <div className="flex h-16 items-center px-6 mb-4">
        <div className="flex items-center gap-3 font-serif text-xl font-semibold tracking-wide">
          <Feather className="h-5 w-5" />
          Quillio
        </div>
      </div>

      <div className="flex-1 space-y-3 px-3">
        <div className="space-y-1">
            <NavItem to="/" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
            <NavItem to="/capture" icon={<PenTool className="h-5 w-5" />} label="Daily Captures" />
            <NavItem to="/reviews" icon={<Calendar className="h-5 w-5" />} label="Weekly Reviews" />
            <NavItem to="/decisions" icon={<Database className="h-5 w-5" />} label="Decision Bank" />
        </div>
      </div>

      <div className="p-4 border-t border-white/5 mt-auto">
         <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[#C17A72] text-white shadow-md"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      )
    }
  >
    {icon}
    {label}
  </NavLink>
);
