import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Brain, LineChart } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-body">
      {/* Hero Section */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            <Activity className="w-4 h-4" />
            Parkinson's Assistive Tech
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6 leading-tight">
            Track tremors. <br />
            <span className="text-primary">Optimize care.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
            A comprehensive tool to monitor motor symptoms, log medication, and visualize trends—helping you and your doctor make informed decisions.
          </p>

          <Button 
            size="lg" 
            onClick={handleLogin}
            className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
          >
            Get Started
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Feature icon={Brain} title="Motor Analysis" desc="Digitize and quantify handwriting tremors." />
            <Feature icon={LineChart} title="Trend Tracking" desc="Visualize ON/OFF states over time." />
            <Feature icon={Activity} title="Medication Log" desc="Correlate doses with symptom relief." />
          </div>
        </motion.div>
      </div>

      {/* Visual Side (Optional, or just keep centered for cleaner look on desktop) */}
      <div className="hidden lg:block lg:w-1/2 bg-[#001e2b] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        {/* Unsplash: Medical technology background abstract */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001e2b] via-transparent to-transparent" />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 leading-snug">{desc}</p>
    </div>
  );
}
