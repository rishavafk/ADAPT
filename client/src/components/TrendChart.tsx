import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendChartProps {
  data: Array<{
    timestamp: number;
    tremorScore: number;
    medicationState: string;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    formattedTime: format(new Date(item.timestamp), 'MMM d, HH:mm'),
    originalTime: item.timestamp,
  }));

  // Calculate generic domains for axes
  const minScore = Math.min(...data.map(d => d.tremorScore), 0);
  const maxScore = Math.max(...data.map(d => d.tremorScore), 10);

  return (
    <Card className="shadow-lg border-primary/5">
      <CardHeader>
        <CardTitle>Tremor Severity & Medication Effectiveness</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis 
              dataKey="formattedTime" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              domain={[minScore, maxScore]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
              }}
              labelStyle={{ color: '#666', marginBottom: '0.5rem' }}
            />
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Line 
              type="monotone" 
              dataKey="tremorScore" 
              stroke="#0891b2" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#0891b2" }}
              fill="url(#colorScore)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
