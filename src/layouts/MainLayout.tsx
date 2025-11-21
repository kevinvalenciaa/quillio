import { Sidebar } from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans antialiased overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <Outlet />
      </main>
    </div>
  );
};

