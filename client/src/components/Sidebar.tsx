import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  Pill,
  FileText,
  Hand,
  Settings,
  LogOut,
  Menu,
  Mic, // New icon
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tremor Analysis', href: '/analysis', icon: Activity },
    { name: 'Finger Tapping', href: '/finger-tapping', icon: Hand },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Voice Clarity', href: '/speech-training', icon: Mic }, // New
    { name: 'Weekly Report', href: '/report', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#0B1120] border-r border-white/5 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-cyan-500/5 blur-[80px] pointer-events-none" />

      <div className="p-6 relative z-10">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          ADAPT
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-2 ml-11 uppercase tracking-wider">Parkinson's Engine</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 relative z-10">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                )}
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white")} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3 p-3 mb-4 bg-white/5 rounded-xl border border-white/5">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={user?.profileImageUrl ?? undefined} />
            <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-0 left-0 p-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-slate-900/80 backdrop-blur border-white/10 text-white shadow-md">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-white/10 bg-[#0B1120]">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-72 z-40">
        <NavContent />
      </div>
    </>
  );
}
