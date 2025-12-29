import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import Analysis from "@/pages/Analysis";
import Medications from "@/pages/Medications";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import Landing from "@/pages/Landing";
import Report from "@/pages/Report";
import FingerTapping from "@/pages/FingerTapping";
import Settings from "@/pages/Settings";
import SpeechTraining from "@/pages/SpeechTraining";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/analysis" component={() => <ProtectedRoute component={Analysis} />} />
      <Route path="/medications" component={() => <ProtectedRoute component={Medications} />} />
      <Route path="/report" component={() => <ProtectedRoute component={Report} />} />
      <Route path="/finger-tapping" component={() => <ProtectedRoute component={FingerTapping} />} />
      <Route path="/speech-training" component={() => <ProtectedRoute component={SpeechTraining} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
