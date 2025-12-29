import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Activity } from "lucide-react";

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface HandwritingCanvasProps {
  onAnalyze: (points: Point[]) => void;
  isAnalyzing: boolean;
}

export function HandwritingCanvas({ onAnalyze, isAnalyzing }: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

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
        ctx.strokeStyle = "#0891b2"; // Primary color (cyan-600 ish)
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
    if (points.length < 10) return; // Basic validation
    onAnalyze(points);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="p-1 overflow-hidden border-2 border-primary/10 shadow-lg rounded-2xl bg-white relative group">
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] touch-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-opacity-50 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/40 text-2xl font-display font-bold select-none">
            Draw a spiral here...
          </div>
        )}
      </Card>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={clearCanvas}
          className="flex-1 py-6 text-lg font-semibold rounded-xl border-2 hover:bg-secondary/50 transition-all"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Clear
        </Button>
        <Button 
          onClick={handleAnalyze} 
          disabled={points.length < 10 || isAnalyzing}
          className="flex-1 py-6 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
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
