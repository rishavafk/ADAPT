import { Sidebar } from "@/components/Sidebar";
import { HandwritingCanvas } from "@/components/HandwritingCanvas";
import { useCreateSession } from "@/hooks/use-sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analysis() {
  const { mutate, isPending, data: result } = useCreateSession();

  const handleAnalyze = (points: Array<{ x: number, y: number, timestamp: number }>) => {
    mutate({ points });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-foreground">Tremor Analysis</h1>
          <p className="text-muted-foreground">Draw a spiral to assess your current motor control.</p>
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
              <Card className="bg-white/50 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center h-[400px] text-muted-foreground p-8 text-center">
                  <ActivityIcon className="w-16 h-16 mb-4 opacity-20" />
                  <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
                  <p>Draw a continuous spiral on the canvas to the left. Try to keep your hand steady and follow a consistent path.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className={cn(
                  "border-l-4 shadow-lg overflow-hidden",
                  result.tremorState === "Stable" ? "border-l-green-500" :
                  result.tremorState === "Moderate" ? "border-l-amber-500" : "border-l-red-500"
                )}>
                  <CardHeader className="bg-slate-50/50 pb-4">
                    <CardTitle className="text-lg text-muted-foreground">Assessment Result</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-6">
                      {result.tremorState === "Stable" ? (
                        <div className="p-3 bg-green-100 text-green-700 rounded-full">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
                          <AlertCircle className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-3xl font-display font-bold">{result.tremorState}</h2>
                        <p className="text-muted-foreground">Overall tremor state</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Severity Score</div>
                        <div className="text-2xl font-bold">{result.severityScore.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">/10</span></div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Frequency</div>
                        <div className="text-2xl font-bold">{result.estimatedFrequency.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">Hz</span></div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Amplitude</div>
                        <div className="text-2xl font-bold">{result.tremorAmplitude.toFixed(2)}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Jitter</div>
                        <div className="text-2xl font-bold">{result.jitter.toFixed(3)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                  <p><strong>Note:</strong> This analysis is for tracking purposes only and does not constitute a medical diagnosis. Share these results with your neurologist.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
