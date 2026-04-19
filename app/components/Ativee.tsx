import { Clock3 } from 'lucide-react';
import { fetchTotalStorageUsed } from '@/sanity/lib/Store';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';

const Ativee = async () => {
  const storageUsed = await fetchTotalStorageUsed();

  return (
    <Card className="hover-lift animate-enter overflow-hidden border-border/70 bg-card/90 shadow-lg shadow-black/10">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Clock3 className="h-[22px] w-[22px]" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Server storage used</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold tracking-tight">{storageUsed}</span>
            <Badge className="rounded-full bg-secondary text-secondary-foreground">Live</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Ativee
