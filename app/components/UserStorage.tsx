import Image from 'next/image';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { formatBytes } from '@/lib/format-storage';
import { sanityFetch } from '@/sanity/lib/live';
import { QUERY } from '@/sanity/lib/query';

const UserStorage = async ({ uploadKey }: { uploadKey: string }) => {
  const { data: files } = await sanityFetch({ query: QUERY, params: { key: uploadKey } });

  const totalBytes = files.reduce((sum: number, file: { size?: number }) => sum + (file.size || 0), 0);

  return (
    <Card className="overflow-hidden border-border/70 bg-card/90 shadow-lg shadow-black/10">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Image src="/database.png" alt="storage" width={22} height={22} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Your storage used</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold tracking-tight">{formatBytes(totalBytes)}</span>
            <Badge className="rounded-full bg-secondary text-secondary-foreground">{files.length} files</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStorage;