'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DevelopmentDataPoint {
  date: string;
  speed: number;
  technique: number;
  passing: number;
  shooting: number;
  defense: number;
  tactical_awareness: number;
}

interface PlayerDevelopmentChartProps {
  playerId: string;
  data?: DevelopmentDataPoint[];
}

// ---------------------------------------------------------------------------
// Default mock data
// ---------------------------------------------------------------------------

const DEFAULT_MOCK_DATA: DevelopmentDataPoint[] = [
  {
    date: '2025-09',
    speed: 62,
    technique: 55,
    passing: 58,
    shooting: 50,
    defense: 60,
    tactical_awareness: 45,
  },
  {
    date: '2025-10',
    speed: 64,
    technique: 58,
    passing: 60,
    shooting: 53,
    defense: 61,
    tactical_awareness: 48,
  },
  {
    date: '2025-11',
    speed: 65,
    technique: 61,
    passing: 63,
    shooting: 56,
    defense: 63,
    tactical_awareness: 52,
  },
  {
    date: '2025-12',
    speed: 67,
    technique: 63,
    passing: 65,
    shooting: 60,
    defense: 64,
    tactical_awareness: 55,
  },
  {
    date: '2026-01',
    speed: 69,
    technique: 66,
    passing: 67,
    shooting: 63,
    defense: 66,
    tactical_awareness: 59,
  },
  {
    date: '2026-02',
    speed: 70,
    technique: 68,
    passing: 70,
    shooting: 65,
    defense: 67,
    tactical_awareness: 62,
  },
  {
    date: '2026-03',
    speed: 72,
    technique: 71,
    passing: 72,
    shooting: 68,
    defense: 69,
    tactical_awareness: 66,
  },
];

// ---------------------------------------------------------------------------
// Attribute line configuration
// ---------------------------------------------------------------------------

const ATTRIBUTES = [
  { key: 'speed', label: 'Speed', color: '#10b981' },
  { key: 'technique', label: 'Technique', color: '#3b82f6' },
  { key: 'passing', label: 'Passing', color: '#f59e0b' },
  { key: 'shooting', label: 'Shooting', color: '#ef4444' },
  { key: 'defense', label: 'Defense', color: '#8b5cf6' },
  { key: 'tactical_awareness', label: 'Tactical Awareness', color: '#06b6d4' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlayerDevelopmentChart({
  data,
}: PlayerDevelopmentChartProps) {
  const chartData = data ?? DEFAULT_MOCK_DATA;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              fontSize: '13px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
          {ATTRIBUTES.map((attr) => (
            <Line
              key={attr.key}
              type="monotone"
              dataKey={attr.key}
              name={attr.label}
              stroke={attr.color}
              strokeWidth={2}
              dot={{ r: 3, fill: attr.color, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: attr.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
