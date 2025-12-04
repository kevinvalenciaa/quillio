import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Overlay from "./pages/Overlay";
import Dashboard from "./pages/Dashboard";
import DailyCapture from "./pages/DailyCapture";
import MondayRitual from "./pages/MondayRitual";
import FridayRecap from "./pages/FridayRecap";
import DecisionBank from "./pages/DecisionBank";
import WeeklyReview from "./pages/WeeklyReview";
import Settings from "./pages/Settings";
import Canvas from "./pages/Canvas";
import Insights from "./pages/Insights";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { AuthProvider, RequireAuth, useNeedsOnboarding, useAuth } from "./context/AuthContext";
import { QuickCaptureOverlay, useQuickCapture } from "./components/QuickCaptureOverlay";

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

const QuickCaptureHandler = () => {
  const { isOpen, close } = useQuickCapture();
  const { addCapture, loading } = useAppData();
  const { user } = useAuth();

  const handleCapture = async (content: string, type: 'voice' | 'text') => {
    // Check if user is logged in
    if (!user) {
      console.error('Quick capture: No user logged in');
      return null;
    }
    
    // Return the result so the overlay knows if it succeeded
    try {
      console.log('Quick capture: Attempting to save...', { content: content.slice(0, 30), type, userId: user.id });
      const result = await addCapture(content, type);
      console.log('Quick capture: Result:', result);
      return result;
    } catch (error) {
      console.error('Quick capture failed:', error);
      return null;
    }
  };

  // Don't show overlay if not logged in or still loading
  if (!user && isOpen) {
    console.warn('Quick capture: Overlay opened but user not logged in');
  }

  return (
    <QuickCaptureOverlay 
      isOpen={isOpen} 
      onClose={close} 
      onCapture={handleCapture}
    />
  );
};

// Redirect to onboarding if user hasn't completed it
const OnboardingRedirect = ({ children }: { children: React.ReactNode }) => {
  const needsOnboarding = useNeedsOnboarding();
  const location = useLocation();
  
  // Don't redirect if already on onboarding page
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <AppDataProvider>
        <TooltipProvider>
          <Router>
            <LayoutHandler>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/overlay" element={<Overlay />} />
                
                {/* Full-screen rituals (protected + onboarding check) */}
                <Route path="/ritual" element={<RequireAuth><OnboardingRedirect><MondayRitual /></OnboardingRedirect></RequireAuth>} />
                <Route path="/recap" element={<RequireAuth><OnboardingRedirect><FridayRecap /></OnboardingRedirect></RequireAuth>} />
                
                {/* Main app (protected + onboarding check) */}
                <Route element={<RequireAuth><OnboardingRedirect><MainLayout /></OnboardingRedirect></RequireAuth>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/capture" element={<DailyCapture />} />
                  <Route path="/reviews" element={<WeeklyReview />} />
                  <Route path="/decisions" element={<DecisionBank />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/canvas" element={<Canvas />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/library" element={<div>Library (Coming Soon)</div>} />
                </Route>
                
                {/* Onboarding (protected, no redirect loop) */}
                <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
              </Routes>
              <Toaster />
              <QuickCaptureHandler />
            </LayoutHandler>
          </Router>
        </TooltipProvider>
      </AppDataProvider>
    </AuthProvider>
  );
};

export default App;
