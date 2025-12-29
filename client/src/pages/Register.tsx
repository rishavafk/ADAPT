import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isRegistering } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(
      { email, password, firstName, lastName },
      {
        onSuccess: () => {
          toast({ title: "Account created", description: "Welcome to ADAPT." });
          setLocation("/login");
        },
        onError: (error) => {
          toast({ title: "Registration failed", description: (error as Error).message, variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-body selection:bg-cyan-500/30">

      {/* Living Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] rounded-full bg-cyan-500/10 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10 px-6 py-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

          <Link href="/">
            <a className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 text-sm group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </a>
          </Link>

          <Link href="/">
            <a className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight">ADAPT</span>
            </a>
          </Link>

          <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400 mb-8">Join thousands of patients taking back control.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-white/10 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-white/10 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 mt-4"
              disabled={isRegistering}
            >
              {isRegistering ? "Creating..." : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login">
              <a className="text-cyan-400 font-bold hover:underline">Log in</a>
            </Link>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
