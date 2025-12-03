import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Overlay from "./pages/Overlay";
import Dashboard from "./pages/Dashboard";
import DailyCapture from "./pages/DailyCapture";
import MondayRitual from "./pages/MondayRitual";
import FridayRecap from "./pages/FridayRecap";
import DecisionBank from "./pages/DecisionBank";
import WeeklyReview from "./pages/WeeklyReview";
import Canvas from "./pages/Canvas";
import Insights from "./pages/Insights";
import Onboarding from "./pages/Onboarding";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";

const LayoutHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isOverlay = location.pathname === "/overlay";

  useEffect(() => {
    if (isOverlay) {
      document.body.classList.add("bg-transparent");
      document.body.classList.remove("bg-background");
    } else {
      document.body.classList.remove("bg-transparent");
      document.body.classList.add("bg-background");
    }
  }, [isOverlay]);

  return <>{children}</>;
};

const App = () => {
  return (
    <TooltipProvider>
      <Router>
        <LayoutHandler>
          <Routes>
            <Route path="/overlay" element={<Overlay />} />
            <Route path="/ritual" element={<MondayRitual />} />
            <Route path="/recap" element={<FridayRecap />} />
            <Route path="/weekly-review" element={<WeeklyReview />} />
            
            <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/capture" element={<DailyCapture />} />
                <Route path="/reviews" element={<WeeklyReview />} />
                <Route path="/decisions" element={<DecisionBank />} />
                <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                
                <Route path="/canvas" element={<Canvas />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/library" element={<div>Library (Coming Soon)</div>} />
            </Route>
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
          <Toaster />
        </LayoutHandler>
      </Router>
    </TooltipProvider>
  );
};

export default App;
