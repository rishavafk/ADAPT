import { useDashboard } from "@/hooks/use-dashboard";
import { useSessions } from "@/hooks/use-sessions";
import { useMedications } from "@/hooks/use-medications";
import { useFingerTapping } from "@/hooks/use-finger-tapping";
import { useAIInsight } from "@/hooks/use-ai-insight";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Zap, AlertCircle, FileText, Brain, Sparkles, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { UnifiedTimelineChart, type TimelinePoint } from "@/components/UnifiedTimelineChart";

function minutesBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 60000);
}

function predictState(timeSinceDoseMin: number | null, severityScore: number | null): "ON" | "WEARING_OFF" | "OFF" {
  const t = timeSinceDoseMin ?? 999;
  const s = severityScore ?? 0;
  if (t <= 120 && s <= 4) return "ON";
  if (t <= 240) return "WEARING_OFF";
  return "OFF";
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const { data: sessions } = useSessions();
  const { data: meds } = useMedications();
  const { data: fingerTaps } = useFingerTapping();
  const aiInsight = useAIInsight();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />
        <main className="flex-1 lg:pl-72 p-6 md:p-8 space-y-8">
          {/* Skeleton Loading State for Dark Mode */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-48 bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-2xl bg-slate-800" />
            <Skeleton className="h-40 rounded-2xl bg-slate-800" />
            <Skeleton className="h-40 rounded-2xl bg-slate-800" />
          </div>
          <Skeleton className="h-96 rounded-2xl bg-slate-800" />
        </main>
      </div>
    );
  }

  const handleGenerateAIInsight = () => {
    aiInsight.mutate({
      sessions: sessions ?? [],
      meds: meds ?? [],
      fingerTaps: fingerTaps ?? [],
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A] font-body text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />

      <main className="flex-1 lg:pl-72">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto"
        >
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
              <p className="text-slate-400">Real-time motor cortex analytics.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              LIVE DATA
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item}>
              <Card className="h-full bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-cyan-500/30 transition-colors shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    Medication State
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-3xl font-bold font-display",
                    data?.currentMedicationState === "ON" ? "text-emerald-400" :
                      data?.currentMedicationState === "WEARING_OFF" ? "text-amber-400" : "text-rose-400"
                  )}>
                    {data?.currentMedicationState?.replace("_", " ")}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {data?.timeSinceLastDoseMinutes} mins since last dose
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-purple-500/30 transition-colors shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    Avg. Tremor Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-white">
                    {data?.averageTremorScore.toFixed(1)}
                  </div>
                  <p className={cn("text-sm mt-1 font-medium flex items-center gap-1",
                    data?.tremorTrend === "Improving" ? "text-emerald-400" :
                      data?.tremorTrend === "Worsening" ? "text-rose-400" : "text-slate-500"
                  )}>
                    <TrendingUp className="w-3 h-3" />
                    {data?.tremorTrend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-indigo-500/30 transition-colors shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Efficacy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-white">
                    {data?.medicationEffectivenessScore}%
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.medicationEffectivenessScore}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-white mb-2">Weekly Insight</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {data?.insight || "Keep logging your medication and tremor assessments to generate personalized insights."}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/5 bg-transparent"
                      onClick={() => setLocation("/report")}
                    >
                      <FileText className="w-4 h-4" />
                      Full Report
                    </Button>
                    <Button
                      className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-900/20"
                      onClick={handleGenerateAIInsight}
                      disabled={aiInsight.isPending}
                    >
                      <Brain className="w-4 h-4" />
                      {aiInsight.isPending ? "Analyzing..." : "Calculate New Insight"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {aiInsight.data && (
            <motion.div variants={item}>
              <Card className="border-l-4 border-l-emerald-500 bg-emerald-950/20 border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                    AI-Generated Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{aiInsight.data.insight}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item} className="grid grid-cols-1 gap-6">
            <Card className="bg-slate-900/50 border-white/5 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const now = new Date();
                  const sessionPoints: TimelinePoint[] = (sessions ?? []).map((s: any) => {
                    const ts = new Date(s.timestamp);
                    const sev = typeof s.severityScore === "number" ? s.severityScore : null;
                    const timeSinceDose = typeof data?.timeSinceLastDoseMinutes === "number" ? data.timeSinceLastDoseMinutes : null;
                    const predictedState = predictState(timeSinceDose, sev);
                    return {
                      t: ts.getTime(),
                      severity: sev,
                      label: "Session",
                      predictedState,
                    };
                  });

                  const medPoints: TimelinePoint[] = (meds ?? []).map((m: any) => {
                    const ts = new Date(m.timeTaken);
                    return {
                      t: ts.getTime(),
                      severity: null,
                      label: "Medication",
                      predictedState: predictState(minutesBetween(now, ts), null),
                      medicationEvent: { name: m.medicationName, dosage: m.dosage },
                    };
                  });

                  const fingerTappingPoints: TimelinePoint[] = (fingerTaps ?? []).map((ft: any) => {
                    const ts = new Date(ft.timestamp);
                    return {
                      t: ts.getTime(),
                      severity: null,
                      label: "Finger Tapping",
                      predictedState: "ON",
                      fingerTappingEvent: {
                        hand: ft.hand,
                        tapsPerSecond: ft.tapsPerSecond,
                        regularityScore: ft.regularityScore,
                      },
                    };
                  });

                  const combined = [...sessionPoints, ...medPoints, ...fingerTappingPoints]
                    .sort((a, b) => a.t - b.t)
                    .slice(-80);

                  if (!combined.length) {
                    return (
                      <div className="p-12 text-center text-slate-500">
                        <p>No data yet. Run your first tremor test to visualize your dashboard.</p>
                      </div>
                    );
                  }

                  return <UnifiedTimelineChart data={combined} />;
                })()}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
