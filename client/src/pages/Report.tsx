import { Sidebar } from "@/components/Sidebar";
import { useSessions } from "@/hooks/use-sessions";
import { useMedications } from "@/hooks/use-medications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, subDays, isAfter } from "date-fns";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Download, Calendar, Activity, Pill, TrendingUp, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UnifiedTimelineChart, type TimelinePoint } from "@/components/UnifiedTimelineChart";

export default function Report() {
  const { user } = useAuth();
  const { data: sessions } = useSessions();
  const { data: meds } = useMedications();
  const [isPrinting, setIsPrinting] = useState(false);

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const recentSessions = (sessions ?? []).filter((s: any) => isAfter(new Date(s.timestamp), sevenDaysAgo));
  const recentMeds = (meds ?? []).filter((m: any) => isAfter(new Date(m.timeTaken), sevenDaysAgo));

  const avgTremor = recentSessions.length
    ? recentSessions.reduce((sum: number, s: any) => sum + (s.severityScore ?? 0), 0) / recentSessions.length
    : 0;

  const bestScore = Math.min(...recentSessions.map((s: any) => s.severityScore ?? 10), 10);
  const worstScore = Math.max(...recentSessions.map((s: any) => s.severityScore ?? 0), 0);

  const sessionPoints: TimelinePoint[] = recentSessions.map((s: any) => ({
    t: new Date(s.timestamp).getTime(),
    severity: s.severityScore,
    label: "Session",
    predictedState: "ON", // placeholder; could be derived
  }));

  const medPoints: TimelinePoint[] = recentMeds.map((m: any) => ({
    t: new Date(m.timeTaken).getTime(),
    severity: null,
    label: "Medication",
    predictedState: "ON",
    medicationEvent: { name: m.medicationName, dosage: m.dosage },
  }));

  const combined = [...sessionPoints, ...medPoints].sort((a, b) => a.t - b.t);

  useEffect(() => {
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className={`min-h-screen bg-white font-body ${isPrinting ? "print:p-0 print:m-0" : ""}`}>
      {!isPrinting && <Sidebar />}
      <main className={`${!isPrinting ? "lg:pl-72" : ""} p-6 md:p-8 max-w-5xl mx-auto space-y-8`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Weekly Report</h1>
            <p className="text-muted-foreground">Last 7 days of tremor assessments and medication logs</p>
          </div>
          {!isPrinting && (
            <Button onClick={handlePrint} className="gap-2">
              <Download className="w-4 h-4" />
              Download / Print
            </Button>
          )}
        </div>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <div className="font-medium">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="font-medium">{user?.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Report Date:</span>
                <div className="font-medium">{format(now, "PPP")}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Period:</span>
                <div className="font-medium">
                  {format(sevenDaysAgo, "MMM d")} – {format(now, "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{recentSessions.length}</div>
              <div className="text-sm text-muted-foreground">Tremor Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Pill className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{recentMeds.length}</div>
              <div className="text-sm text-muted-foreground">Medication Logs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{avgTremor.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Tremor Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {recentMeds.length
                  ? Math.round(
                      recentMeds.reduce(
                        (sum: number, m: any, i: number) =>
                          sum +
                          (i === 0
                            ? 0
                            : (new Date(m.timeTaken).getTime() -
                                new Date(recentMeds[i - 1].timeTaken).getTime()) /
                              (1000 * 60)),
                        0
                      ) / Math.max(1, recentMeds.length - 1)
                    )
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Interval (min)</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        {combined.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline (Tremor + Medication)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedTimelineChart data={combined} />
            </CardContent>
          </Card>
        )}

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Tremor Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No sessions this period.</div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="font-medium">{format(new Date(s.timestamp), "PPPp")}</div>
                      <div className="text-sm text-muted-foreground">Severity: {s.severityScore?.toFixed(1)} / 10</div>
                    </div>
                    <Badge variant={s.tremorState === "Stable" ? "default" : s.tremorState === "Moderate" ? "secondary" : "destructive"}>
                      {s.tremorState}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medication Details */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMeds.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No medications logged this period.</div>
            ) : (
              <div className="space-y-3">
                {recentMeds.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="font-medium">{m.medicationName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(m.timeTaken), "PPPp")}
                      </div>
                    </div>
                    <Badge variant="outline">{m.dosage}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        {!isPrinting && (
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>Generated by ADAPT – Parkinson’s Assistant</p>
            <p className="mt-1">Not a substitute for professional medical advice.</p>
          </div>
        )}
      </main>
    </div>
  );
}
