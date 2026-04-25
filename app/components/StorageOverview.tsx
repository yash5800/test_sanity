import Link from 'next/link';
import { Database, HardDriveUpload, Layers3 } from 'lucide-react';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { formatBytes } from '@/lib/format-storage';
import { fetchTotalStorageBytes } from '@/sanity/lib/Store';
import { sanityFetch } from '@/sanity/lib/live';
import { QUERY } from '@/sanity/lib/query';
import WipeKeyButton from './WipeKeyButton';

const StorageOverview = async ({ uploadKey }: { uploadKey: string }) => {
  const [serverBytes, { data: files }] = await Promise.all([
    fetchTotalStorageBytes(),
    sanityFetch({ query: QUERY, params: { key: uploadKey } }),
  ]);

  const workspaceBytes = files.reduce((sum: number, file: { size?: number }) => sum + (file.size || 0), 0);

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg shadow-black/20">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Badge className="rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold">Storage Space</Badge>
          <span className="text-sm text-muted-foreground">{files.length} file{files.length === 1 ? '' : 's'}</span>
        </div>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Storage overview
        </CardTitle>
        <CardDescription>A simple summary with direct access to upload and file browsing. Files auto-remove after 24 hrs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-blue-500/10 via-background to-background p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <p>Server storage used</p>
              <Layers3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{formatBytes(serverBytes)}</p>
            <p className="mt-2 text-sm text-muted-foreground">All files stored across the server.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-purple-500/10 via-background to-background p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <p>Storage space used</p>
              <HardDriveUpload className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{formatBytes(workspaceBytes)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {files.length === 0 ? 'No files uploaded yet.' : 'Everything in this storage space is shown below.'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="#upload"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border/70 bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Upload files
          </Link>
          <Link
            href="#files"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 text-sm font-medium text-white transition-all"
          >
            Jump to files
          </Link>
          <WipeKeyButton uploadKey={uploadKey} fileCount={files.length} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageOverview;