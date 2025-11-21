import { NavLink } from "react-router-dom";
import { Home, Grid, BarChart2, Folder, Plus, Settings, Search } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-background/50 backdrop-blur-xl">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-2 font-semibold text-white">
          <div className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-500 flex items-center justify-center">
            Q
          </div>
          Quillio
        </div>
      </div>

      <div className="flex-1 space-y-1 p-3">
        <div className="mb-4 px-2">
            <Button variant="outline" className="w-full justify-start text-muted-foreground bg-white/5 border-white/5 hover:bg-white/10 hover:text-white">
                <Search className="mr-2 h-4 w-4" />
                Search... <span className="ml-auto text-xs text-muted-foreground">⌘K</span>
            </Button>
        </div>

        <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Stream" />
        <NavItem to="/canvas" icon={<Grid className="h-4 w-4" />} label="Canvas" />
        <NavItem to="/insights" icon={<BarChart2 className="h-4 w-4" />} label="Insights" />
        <NavItem to="/library" icon={<Folder className="h-4 w-4" />} label="Library" />
      </div>

      <div className="p-3 border-t border-white/10">
         <Button className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700 mb-2">
            <Plus className="mr-2 h-4 w-4" /> New Canvas
         </Button>
         <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white">
            <Settings className="mr-2 h-4 w-4" /> Settings
         </Button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-muted-foreground hover:bg-white/5 hover:text-white"
      )
    }
  >
    {icon}
    {label}
  </NavLink>
);

