import Link from 'next/link';

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
    <Card className="overflow-hidden border-border/70 bg-card/90 shadow-lg shadow-black/10">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Badge className="rounded-full bg-secondary text-secondary-foreground">Workspace</Badge>
          <span className="text-sm text-muted-foreground">{files.length} file{files.length === 1 ? '' : 's'}</span>
        </div>
        <CardTitle className="text-2xl">Storage overview</CardTitle>
        <CardDescription>A simple summary with direct access to upload and file browsing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-border/70 bg-background/60 p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Server storage used</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{formatBytes(serverBytes)}</p>
            <p className="mt-2 text-sm text-muted-foreground">All files stored across the server.</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/60 p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Workspace storage used</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{formatBytes(workspaceBytes)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {files.length === 0 ? 'No files uploaded yet.' : 'Everything in this workspace is shown below.'}
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
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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