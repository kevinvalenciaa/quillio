import { Sidebar } from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#0F1729] text-white font-sans antialiased overflow-hidden relative selection:bg-accent/30">
       {/* Atmospheric Background */}
       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Dark blue base */}
          <div className="absolute inset-0 bg-[#0F1729]" />
          
          {/* Sunrise/Sunset Glow (Bottom Center) - Rust/Orange tones */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[140%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C17A72]/15 via-[#8B5A5A]/10 to-transparent blur-[100px] opacity-50" />
          
          {/* Top Atmospheric Haze */}
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-[#0F1729] via-[#0F1729]/90 to-transparent" />
          
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-[#0F1729]/40" />
       </div>

      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
