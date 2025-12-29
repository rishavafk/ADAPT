import { useDashboard } from "@/hooks/use-dashboard";
import { Sidebar } from "@/components/Sidebar";
import { TrendChart } from "@/components/TrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 lg:pl-72 p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </main>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      <Sidebar />
      
      <main className="flex-1 lg:pl-72">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your symptoms and medication effectiveness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item}>
              <Card className="h-full border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Medication State
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-3xl font-bold font-display",
                    data?.currentMedicationState === "ON" ? "text-green-600" : 
                    data?.currentMedicationState === "WEARING_OFF" ? "text-amber-500" : "text-destructive"
                  )}>
                    {data?.currentMedicationState?.replace("_", " ")}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data?.timeSinceLastDoseMinutes} mins since last dose
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Average Tremor Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-foreground">
                    {data?.averageTremorScore.toFixed(1)}
                  </div>
                  <p className={cn("text-sm mt-1 font-medium", 
                    data?.tremorTrend === "Improving" ? "text-green-600" : 
                    data?.tremorTrend === "Worsening" ? "text-destructive" : "text-slate-500"
                  )}>
                    Trend: {data?.tremorTrend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Effectiveness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-foreground">
                    {data?.medicationEffectivenessScore}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on symptom reduction
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-lg shadow-primary/5 flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-primary">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-1">Weekly Insight</h3>
                <p className="text-slate-600 leading-relaxed">
                  {data?.insight || "Keep logging your medication and tremor assessments to generate personalized insights."}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 gap-6">
            {data?.trendTimeline && data.trendTimeline.length > 0 ? (
              <TrendChart data={data.trendTimeline} />
            ) : (
              <Card className="p-12 text-center text-muted-foreground">
                <p>No enough data to visualize trends yet.</p>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
