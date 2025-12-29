import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
  ReferenceArea,
} from "recharts";

export type TimelinePoint = {
  t: number;
  severity: number | null;
  label: string;
  predictedState: "ON" | "WEARING_OFF" | "OFF";
  medicationEvent?: {
    name: string;
    dosage?: string | null;
  };
  fingerTappingEvent?: {
    hand: "left" | "right";
    tapsPerSecond: number;
    regularityScore: number;
  };
};

type Props = {
  data: TimelinePoint[];
};

function stateColor(state: TimelinePoint["predictedState"]) {
  if (state === "ON") return "rgba(34, 197, 94, 0.10)";
  if (state === "WEARING_OFF") return "rgba(245, 158, 11, 0.10)";
  return "rgba(239, 68, 68, 0.10)";
}

export function UnifiedTimelineChart({ data }: Props) {
  const points = [...data].sort((a, b) => a.t - b.t);

  const minScore = 0;
  const maxScore = 10;

  const segments: Array<{ x1: number; x2: number; state: TimelinePoint["predictedState"] }> = [];
  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const next = points[i + 1];
    if (!next) break;
    if (segments.length && segments[segments.length - 1].state === cur.predictedState) {
      segments[segments.length - 1].x2 = next.t;
    } else {
      segments.push({ x1: cur.t, x2: next.t, state: cur.predictedState });
    }
  }

  const medicationPoints = points
    .filter((p) => p.medicationEvent)
    .map((p) => ({ ...p, y: 9.7 }));

  const fingerTappingPoints = points
    .filter((p) => p.fingerTappingEvent)
    .map((p) => ({ ...p, y: 8.5 }));

  return (
    <Card className="shadow-lg border-primary/5">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Symptom Timeline (Tremor + Medication + Finger Tapping)</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Tremor severity over time with medication events, finger tapping tests, and predicted state shading.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">ON</Badge>
          <Badge variant="outline">WEARING OFF</Badge>
          <Badge variant="destructive">OFF</Badge>
        </div>
      </CardHeader>

      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />

            {segments.map((s) => (
              <ReferenceArea
                key={`${s.x1}-${s.x2}-${s.state}`}
                x1={s.x1}
                x2={s.x2}
                y1={minScore}
                y2={maxScore}
                fill={stateColor(s.state)}
                ifOverflow="extendDomain"
              />
            ))}

            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) => format(new Date(v), "MMM d, HH:mm")}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              minTickGap={40}
            />
            <YAxis
              domain={[minScore, maxScore]}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <Tooltip
              labelFormatter={(v) => format(new Date(Number(v)), "PPpp")}
              formatter={(value: any, name: any, props: any) => {
                if (name === "severity") return [Number(value).toFixed(1), "Tremor severity"];
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: "rgba(30, 41, 59, 0.95)", // Dark background for tooltip
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                color: "#e2e8f0", // Light text color for tooltip
              }}
            />

            <Line
              type="monotone"
              dataKey="severity"
              connectNulls
              stroke="#0891b2"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#0891b2" }}
            />

            <Scatter
              data={medicationPoints}
              dataKey="y"
              fill="#7c3aed"
              shape={(props: any) => {
                const { cx, cy } = props;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={5} fill="#7c3aed" />
                    <circle cx={cx} cy={cy} r={9} fill="rgba(124, 58, 237, 0.15)" />
                  </g>
                );
              }}
            />
            <Scatter
              data={fingerTappingPoints}
              dataKey="y"
              fill="#f97316"
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={5} fill="#f97316" />
                    <circle cx={cx} cy={cy} r={9} fill="rgba(249, 115, 22, 0.15)" />
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
