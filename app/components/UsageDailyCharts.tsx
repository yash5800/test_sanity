"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { formatBytes } from '@/lib/format-storage';

interface DailyUsagePoint {
  label: string;
  uploads: number;
  bytes: number;
}

const UsageDailyCharts = ({ data }: { data: DailyUsagePoint[] }) => {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <Card className='hover-lift animate-enter overflow-hidden border-border/70 bg-card/90 shadow-sm shadow-black/10'>
        <div className='h-1.5 bg-gradient-to-r from-chart-2 via-primary to-chart-4' />
        <CardHeader>
          <CardTitle className='text-xl'>Daily uploads</CardTitle>
        </CardHeader>
        <CardContent className='h-[280px] pt-1'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id='uploadsGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='hsl(var(--chart-2))' stopOpacity={0.45} />
                  <stop offset='95%' stopColor='hsl(var(--chart-2))' stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke='hsl(var(--border))' strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='label' tickLine={false} axisLine={false} dy={8} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={26} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.9rem',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                }}
              />
              <Area
                type='monotone'
                dataKey='uploads'
                stroke='hsl(var(--chart-2))'
                fill='url(#uploadsGradient)'
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: 'hsl(var(--chart-2))' }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className='hover-lift animate-enter overflow-hidden border-border/70 bg-card/90 shadow-sm shadow-black/10' style={{ animationDelay: '80ms' }}>
        <div className='h-1.5 bg-gradient-to-r from-primary via-chart-4 to-chart-2' />
        <CardHeader>
          <CardTitle className='text-xl'>Daily storage growth</CardTitle>
        </CardHeader>
        <CardContent className='h-[280px] pt-1'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke='hsl(var(--border))' strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='label' tickLine={false} axisLine={false} dy={8} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                tickMargin={12}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatBytes(Number(value))}
              />
              <Tooltip
                formatter={(value) => formatBytes(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: '0.9rem',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                }}
              />
              <Bar dataKey='bytes' radius={[8, 8, 0, 0]} fill='hsl(var(--primary))' maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDailyCharts;
