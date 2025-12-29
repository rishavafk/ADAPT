import { Sidebar } from "@/components/Sidebar";
import { HandwritingCanvas } from "@/components/HandwritingCanvas";
import { useCreateSession } from "@/hooks/use-sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Activity, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analysis() {
  const { mutate, isPending, data: result } = useCreateSession();

  const handleAnalyze = (points: Array<{ x: number, y: number, timestamp: number }>) => {
    mutate({ points });
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A] font-body text-slate-200">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-white">Tremor Analysis</h1>
          <p className="text-slate-400">Draw a spiral to assess your current motor control.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HandwritingCanvas onAnalyze={handleAnalyze} isAnalyzing={isPending} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {!result ? (
              <Card className="bg-slate-900/50 border-white/5 border-dashed border-2 shadow-xl backdrop-blur-sm h-[400px]">
                <CardContent className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 animate-pulse">
                    <Activity className="w-10 h-10 text-cyan-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                  <p className="max-w-md mx-auto">Draw a continuous spiral on the canvas to the left. Try to keep your hand steady and follow a consistent path.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className={cn(
                  "border-l-4 shadow-2xl overflow-hidden bg-slate-900 border-white/5",
                  result.tremorState === "Stable" ? "border-l-emerald-500" :
                    result.tremorState === "Moderate" ? "border-l-amber-500" : "border-l-rose-500"
                )}>
                  <CardHeader className="bg-white/5 pb-4 border-b border-white/5">
                    <CardTitle className="text-lg text-slate-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Assessment Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-8">
                      {result.tremorState === "Stable" ? (
                        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full shadow-lg shadow-emerald-500/10">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                      ) : (
                        <div className={cn("p-4 rounded-full shadow-lg",
                          result.tremorState === "Moderate" ? "bg-amber-500/10 text-amber-400 shadow-amber-500/10" : "bg-rose-500/10 text-rose-400 shadow-rose-500/10"
                        )}>
                          <AlertCircle className="w-10 h-10" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-4xl font-display font-bold text-white tracking-tight">{result.tremorState}</h2>
                        <p className="text-slate-400 font-medium">Overall tremor state</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Severity Score</div>
                        <div className="text-3xl font-bold text-white">{result.severityScore.toFixed(1)}<span className="text-lg font-normal text-slate-500">/10</span></div>
                      </div>
                      <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Frequency</div>
                        <div className="text-3xl font-bold text-white">{result.estimatedFrequency.toFixed(1)}<span className="text-lg font-normal text-slate-500">Hz</span></div>
                      </div>
                      <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Amplitude</div>
                        <div className="text-3xl font-bold text-white">{result.tremorAmplitude.toFixed(2)}</div>
                      </div>
                      <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-500 mb-1 font-medium uppercase tracking-wider">Jitter</div>
                        <div className="text-3xl font-bold text-white">{result.jitter.toFixed(3)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Note:</strong> This analysis is for tracking purposes only and does not constitute a medical diagnosis. Share these results with your neurologist to help adjust your treatment plan.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
