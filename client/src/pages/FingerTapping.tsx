import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Hand, Play, Pause, RotateCcw, Clock, Zap, TrendingUp, Volume2, VolumeX, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface TapEvent {
  timestamp: number;
  interval?: number;
}

interface TapResult {
  avgInterval: number;
  stdDev: number;
  tapsPerSecond: number;
  regularityScore: number;
  asymmetryScore: number;
  rhythmStability: number;
  totalTaps: number;
}

export default function FingerTapping() {
  const [, setLocation] = useLocation();
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [taps, setTaps] = useState<TapEvent[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hand, setHand] = useState<"left" | "right">("right");
  const audioContext = useRef<AudioContext | null>(null);
  const startTime = useRef<number | null>(null);

  const saveResult = useMutation({
    mutationFn: async (result: TapResult) => {
      const res = await fetch("/api/finger-tapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result, hand }),
      });
      if (!res.ok) throw new Error("Failed to save result");
      return res.json();
    },
    onSuccess: () => setLocation("/dashboard"),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioContext.current?.close();
    };
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabled || !audioContext.current) return;
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    osc.connect(gain);
    gain.connect(audioContext.current.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(audioContext.current.currentTime + 0.05);
  }, [soundEnabled]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    if (timeLeft <= 3) playBeep();
    if (timeLeft === 0) {
      setIsRunning(false);
      setIsFinished(true);
    }
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, playBeep]);

  const handleTap = useCallback(() => {
    if (!isRunning || isFinished) return;
    const now = Date.now();
    if (!startTime.current) startTime.current = now;
    const interval = taps.length > 0 ? now - taps[taps.length - 1].timestamp : undefined;
    setTaps((prev) => [...prev, { timestamp: now, interval }]);
    playBeep();
  }, [isRunning, isFinished, taps, playBeep]);

  // Auto-stop when time reaches 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
    }
  }, [timeLeft, isRunning]);

  const calculateResult = useCallback((): TapResult => {
    if (taps.length < 2) {
      return {
        avgInterval: 0,
        stdDev: 0,
        tapsPerSecond: 0,
        regularityScore: 0,
        asymmetryScore: 0,
        rhythmStability: 0,
        totalTaps: taps.length,
      };
    }
    const intervals = taps.slice(1).map((t) => t.interval!);
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const duration = (taps[taps.length - 1].timestamp - taps[0].timestamp) / 1000;
    const tapsPerSec = duration > 0 ? taps.length / duration : 0;
    const regularityScore = Math.max(0, 100 - (stdDev / avg) * 100);
    const rhythmStability = Math.max(0, 100 - (stdDev / 200) * 100);
    const asymmetryScore = Math.random() * 20; // Placeholder

    return {
      avgInterval: avg,
      stdDev,
      tapsPerSecond: tapsPerSec,
      regularityScore,
      asymmetryScore,
      rhythmStability,
      totalTaps: taps.length,
    };
  }, [taps]);

  const handleStart = () => {
    setIsRunning(true);
    setIsFinished(false);
    setTimeLeft(10);
    setTaps([]);
    startTime.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(10);
    setTaps([]);
    startTime.current = null;
  };

  const result = calculateResult();

  return (
    <div className="flex min-h-screen bg-[#0F172A] font-body text-slate-200">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-white">Finger Tapping Test</h1>
          <p className="text-slate-400">Measure motor rhythm and regularity by tapping at a steady pace for 10 seconds.</p>
        </div>

        {!isFinished ? (
          <Card className="p-8 bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl">
            <div className="space-y-8">
              {/* Hand selector */}
              <div className="flex justify-center gap-4">
                <Button
                  variant={hand === "left" ? "default" : "outline"}
                  onClick={() => setHand("left")}
                  disabled={isRunning}
                  className={hand === "left" ? "bg-cyan-500 hover:bg-cyan-600 text-white border-0" : "bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5"}
                >
                  Left Hand
                </Button>
                <Button
                  variant={hand === "right" ? "default" : "outline"}
                  onClick={() => setHand("right")}
                  disabled={isRunning}
                  className={hand === "right" ? "bg-cyan-500 hover:bg-cyan-600 text-white border-0" : "bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5"}
                >
                  Right Hand
                </Button>
              </div>

              {/* Timer & progress */}
              <div className="text-center space-y-2">
                <div className="text-7xl font-display font-bold text-white tabular-nums tracking-tight">{timeLeft}s</div>
                <Progress value={(10 - timeLeft) / 10 * 100} className="h-2 w-64 mx-auto bg-slate-800" />
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Time remaining</p>
              </div>

              {/* Tap area */}
              <motion.div
                className="relative h-64 bg-slate-800/30 rounded-3xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all flex items-center justify-center cursor-pointer select-none group"
                whileTap={{ scale: 0.98, backgroundColor: "rgba(6, 182, 212, 0.1)" }}
                onClick={handleTap}
              >
                <div className="text-center space-y-4 pointer-events-none">
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Hand className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div className="text-xl font-medium text-white">
                    {isRunning ? "Tap Here Repeatedly" : "Press Start to Begin"}
                  </div>
                  {isRunning && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={taps.length}
                      className="text-4xl font-bold text-cyan-400"
                    >
                      {taps.length}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isRunning ? (
                  <Button onClick={handleStart} size="lg" className="gap-2 h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold shadow-lg shadow-cyan-500/20">
                    <Play className="w-5 h-5 fill-current" />
                    Start Test
                  </Button>
                ) : (
                  <Button onClick={() => setIsRunning(false)} variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg border-white/10 bg-transparent text-white hover:bg-white/5">
                    <Pause className="w-5 h-5 fill-current" />
                    Pause
                  </Button>
                )}
                <Button onClick={handleReset} variant="ghost" size="lg" className="gap-2 h-14 px-6 text-slate-400 hover:text-white hover:bg-white/5">
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="gap-2 h-14 px-4 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-3xl font-bold text-white mb-1">{result.totalTaps}</div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Taps</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-3xl font-bold text-white mb-1">{result.tapsPerSecond.toFixed(1)}</div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Taps/Second</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-3xl font-bold text-white mb-1">{result.regularityScore.toFixed(0)}%</div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Regularity</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-3xl font-bold text-white mb-1">{result.rhythmStability.toFixed(0)}%</div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Stability</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Interpretation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5">
                  <span className="text-slate-300 font-medium">Motor Speed</span>
                  <Badge variant={result.tapsPerSecond > 4 ? "default" : result.tapsPerSecond > 2.5 ? "secondary" : "destructive"} className="px-3 py-1 text-sm font-semibold">
                    {result.tapsPerSecond > 4 ? "Normal" : result.tapsPerSecond > 2.5 ? "Mildly Slow" : "Slow"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5">
                  <span className="text-slate-300 font-medium">Rhythm Regularity</span>
                  <Badge variant={result.regularityScore > 80 ? "default" : result.regularityScore > 60 ? "secondary" : "destructive"} className="px-3 py-1 text-sm font-semibold">
                    {result.regularityScore > 80 ? "Stable" : result.regularityScore > 60 ? "Moderate" : "Irregular"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5">
                  <span className="text-slate-300 font-medium">Overall Performance</span>
                  <Badge className={result.regularityScore > 75 && result.tapsPerSecond > 3 ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"} variant="default">
                    {result.regularityScore > 75 && result.tapsPerSecond > 3 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={() => saveResult.mutate(result)} disabled={saveResult.isPending} className="flex-1 h-14 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold shadow-lg shadow-cyan-500/20">
                <Zap className="mr-2 w-5 h-5" />
                Save Result to Dashboard
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1 h-14 text-lg border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/5">
                <RotateCcw className="mr-2 w-5 h-5" />
                Retest
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
