import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Activity, Eraser } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface HandwritingCanvasProps {
  onAnalyze: (points: Point[]) => void;
  isAnalyzing: boolean;
}

type LiveMetrics = {
  points: number;
  durationMs: number;
  pathLength: number;
  tremorEstimate: number;
  qualityScore: number;
  qualityLabel: "Excellent" | "Good" | "Low";
  blockers: string[];
};

function computeLiveMetrics(points: Point[]): LiveMetrics {
  const count = points.length;
  const durationMs = count >= 2 ? Math.max(0, points[count - 1].timestamp - points[0].timestamp) : 0;

  let pathLength = 0;
  const segmentLengths: number[] = [];
  const segmentSpeeds: number[] = [];

  for (let i = 1; i < count; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pathLength += dist;
    segmentLengths.push(dist);
    const dt = Math.max(1, points[i].timestamp - points[i - 1].timestamp);
    segmentSpeeds.push(dist / dt);
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const stdev = (arr: number[]) => {
    if (!arr.length) return 0;
    const m = avg(arr);
    const v = arr.reduce((acc, x) => acc + (x - m) * (x - m), 0) / arr.length;
    return Math.sqrt(v);
  };

  const speedStd = stdev(segmentSpeeds);
  const lenStd = stdev(segmentLengths);

  const tremorEstimate = Math.min(10, (lenStd * 0.35 + speedStd * 1200) * 0.6);

  const blockers: string[] = [];
  if (count < 40) blockers.push("Draw a bit longer (need more points)");
  if (durationMs < 3500) blockers.push("Keep drawing for ~4–6 seconds");
  if (pathLength < 500) blockers.push("Make a larger spiral to fill the canvas");

  const pointsScore = Math.min(1, count / 140);
  const durationScore = Math.min(1, durationMs / 6000);
  const coverageScore = Math.min(1, pathLength / 900);
  const qualityScore = Math.max(0, Math.min(100, (0.45 * pointsScore + 0.35 * durationScore + 0.2 * coverageScore) * 100));

  const qualityLabel: LiveMetrics["qualityLabel"] =
    qualityScore >= 80 ? "Excellent" : qualityScore >= 55 ? "Good" : "Low";

  return {
    points: count,
    durationMs,
    pathLength,
    tremorEstimate,
    qualityScore,
    qualityLabel,
    blockers,
  };
}

export function HandwritingCanvas({ onAnalyze, isAnalyzing }: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const live = computeLiveMetrics(points);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Handle High DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#22d3ee"; // Cyan-400 for dark mode visibility
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#22d3ee"; // Glow effect
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
    }
    addPoint(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
    addPoint(x, y);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const addPoint = (x: number, y: number) => {
    setPoints(prev => [...prev, { x, y, timestamp: Date.now() }]);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();

    // Check if it's a touch event
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    // Mouse event
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !context) return;
    const rect = canvasRef.current.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    setPoints([]);
  };

  const handleAnalyze = () => {
    if (live.blockers.length) return;
    onAnalyze(points);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="p-1 overflow-hidden border border-white/10 shadow-lg rounded-2xl bg-black/40 relative group">
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] touch-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-opacity-20 cursor-crosshair opacity-80"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500/50 text-2xl font-display font-bold select-none">
            Draw a spiral here...
          </div>
        )}
      </Card>

      <Card className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm text-slate-400 font-medium">Live Signal</div>
            <div className="text-xl font-display font-bold text-white">
              Tremor Meter: <span className={live.tremorEstimate < 3 ? "text-emerald-400" : live.tremorEstimate < 7 ? "text-amber-400" : "text-rose-400"}>{live.tremorEstimate.toFixed(1)}</span>
              <span className="text-sm font-normal text-slate-500"> / 10</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={live.qualityLabel === "Excellent" ? "default" : live.qualityLabel === "Good" ? "secondary" : "destructive"}>
              Quality: {live.qualityLabel}
            </Badge>
            {isDrawing && (
              <Badge variant="outline" className="border-cyan-500 text-cyan-400 animate-pulse">Recording</Badge>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span>Signal quality</span>
            <span>{Math.round(live.qualityScore)}%</span>
          </div>
          <Progress value={live.qualityScore} className="h-2 bg-slate-800" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-slate-800/50 p-3 border border-white/5">
            <div className="text-xs text-slate-500 font-medium">Points</div>
            <div className="font-semibold text-white">{live.points}</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 border border-white/5">
            <div className="text-xs text-slate-500 font-medium">Duration</div>
            <div className="font-semibold text-white">{(live.durationMs / 1000).toFixed(1)}s</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 border border-white/5">
            <div className="text-xs text-slate-500 font-medium">Coverage</div>
            <div className="font-semibold text-white">{Math.round(live.pathLength)}px</div>
          </div>
        </div>

        {live.blockers.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
            <div className="font-semibold text-amber-400">Improve signal for best accuracy</div>
            <div className="mt-1 space-y-1">
              {live.blockers.map((b) => (
                <div key={b}>{b}</div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={clearCanvas}
          className="flex-1 py-6 text-lg font-semibold rounded-xl border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <Eraser className="mr-2 h-5 w-5" />
          Clear
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={live.blockers.length > 0 || isAnalyzing}
          className="flex-1 py-6 text-lg font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all font-bold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-5 w-5" />
              Analyze Tremor
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
