import Link from 'next/link';
import { BarChart3, CalendarRange, ChevronLeft, Clock3, Database, NotebookPen, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import UsageDailyCharts from '@/app/components/UsageDailyCharts';
import { formatBytes } from '@/lib/format-storage';
import { sanityFetch } from '@/sanity/lib/live';
import { QUERY } from '@/sanity/lib/query';

export const metadata: Metadata = {
  title: 'Analysis',
  description: 'Daily usage analysis for storage space uploads.',
};

interface AnalysisFile {
  _id: string;
  _createdAt: string;
  size?: number;
}

const formatDayKey = (date: Date) => date.toISOString().slice(0, 10);

const buildDailySeries = (files: AnalysisFile[], days: number) => {
  const today = new Date();
  const byDay = new Map<string, { uploads: number; bytes: number }>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    byDay.set(formatDayKey(date), { uploads: 0, bytes: 0 });
  }

  files.forEach((file) => {
    const key = formatDayKey(new Date(file._createdAt));
    const day = byDay.get(key);

    if (!day) return;

    day.uploads += 1;
    day.bytes += file.size ?? 0;
  });

  return Array.from(byDay.entries()).map(([key, values]) => {
    const date = new Date(`${key}T00:00:00`);

    return {
      key,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uploads: values.uploads,
      bytes: values.bytes,
    };
  });
};

const AnalysisPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const key = (await params).id;

  const { data } = await sanityFetch({ query: QUERY, params: { key } });
  const files = data as AnalysisFile[];

  const dailySeries = buildDailySeries(files, 14);
  const totalUploads = files.length;
  const totalBytes = files.reduce((sum, file) => sum + (file.size ?? 0), 0);
  const activeDays = dailySeries.filter((point) => point.uploads > 0).length;
  const avgUploadsPerActiveDay = activeDays > 0 ? (totalUploads / activeDays).toFixed(1) : '0.0';

  return (
    <main className='space-y-6'>
      <section className='animate-enter space-y-3'>
        <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
          <Link href={`/user/${key}`} className='inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary'>
            <ChevronLeft className='h-4 w-4' />
            Back to files
          </Link>
          <span>/</span>
          <span className='font-medium text-foreground'>Analysis</span>
        </div>
        <div className='space-y-2'>
          <Badge className='w-fit rounded-full bg-secondary text-secondary-foreground'>Storage space analytics</Badge>
          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Daily usage insights</h1>
          <p className='max-w-2xl text-sm text-muted-foreground sm:text-base'>
            Modern chart view for storage space <span className='font-medium text-foreground'>{key}</span> with upload activity and storage growth over the last 14 days.
          </p>
        </div>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Card className='hover-lift animate-enter border-border/70 bg-card/90 shadow-sm shadow-black/10'>
          <CardHeader className='pb-2'>
            <CardDescription>Total uploads</CardDescription>
            <CardTitle className='text-3xl'>{totalUploads}</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <div className='inline-flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-chart-2' />
              Files stored for this key
            </div>
          </CardContent>
        </Card>

        <Card className='hover-lift animate-enter border-border/70 bg-card/90 shadow-sm shadow-black/10' style={{ animationDelay: '50ms' }}>
          <CardHeader className='pb-2'>
            <CardDescription>Storage space bytes</CardDescription>
            <CardTitle className='text-3xl'>{formatBytes(totalBytes)}</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <div className='inline-flex items-center gap-2'>
              <Database className='h-4 w-4 text-primary' />
              Combined file size tracked
            </div>
          </CardContent>
        </Card>

        <Card className='hover-lift animate-enter border-border/70 bg-card/90 shadow-sm shadow-black/10' style={{ animationDelay: '100ms' }}>
          <CardHeader className='pb-2'>
            <CardDescription>Active days</CardDescription>
            <CardTitle className='text-3xl'>{activeDays}</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <div className='inline-flex items-center gap-2'>
              <CalendarRange className='h-4 w-4 text-chart-4' />
              Days with one or more uploads
            </div>
          </CardContent>
        </Card>

        <Card className='hover-lift animate-enter border-border/70 bg-card/90 shadow-sm shadow-black/10' style={{ animationDelay: '150ms' }}>
          <CardHeader className='pb-2'>
            <CardDescription>Avg uploads/day</CardDescription>
            <CardTitle className='text-3xl'>{avgUploadsPerActiveDay}</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <div className='inline-flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-chart-2' />
              Across active upload days
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 sm:grid-cols-2'>
        <Card className='hover-lift animate-enter border-border/70 bg-card/90 shadow-sm shadow-black/10'>
          <CardHeader className='pb-2'>
            <CardDescription>File retention</CardDescription>
            <CardTitle className='text-3xl'>24 hrs</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <div className='inline-flex items-center gap-2'>
              <Clock3 className='h-4 w-4 text-chart-2' />
              Uploaded files are removed daily.
            </div>
          </CardContent>
        </Card>

        <Card className='hover-lift animate-enter border-border/70 bg-card/90 shadow-sm shadow-black/10' style={{ animationDelay: '50ms' }}>
          <CardHeader className='pb-2'>
            <CardDescription>Note retention</CardDescription>
            <CardTitle className='text-3xl'>10 days</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <div className='inline-flex items-center gap-2'>
              <NotebookPen className='h-4 w-4 text-emerald-500' />
              Code notes are removed automatically.
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <UsageDailyCharts data={dailySeries} />
      </section>
    </main>
  );
};

export default AnalysisPage;
