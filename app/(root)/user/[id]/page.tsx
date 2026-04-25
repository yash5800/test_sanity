import UploadCard from '@/app/components/UploadCard'
import UserFiles from '@/app/components/UserFiles'
import WorkspaceQuickActions from '@/app/components/WorkspaceQuickActions';
import StorageOverview from '@/app/components/StorageOverview';
import SpaceSwitcher from '@/app/components/SpaceSwitcher';
import CodeSpacePanel from '@/app/components/CodeSpacePanel';
import CodeSpaceGuard from '@/app/components/CodeSpaceGuard';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import Link from 'next/link';
import { Metadata } from 'next';
import React, { Suspense } from 'react'

export const metadata: Metadata = {
  title: "Files" ,
  description: "SanityHub to Store",
};

const page = async ({
  params,
  searchParams,
}:{
  params:Promise<{id:string}>;
  searchParams?: Promise<{ space?: string }>;
}) => {
  const key = (await params).id
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeSpace = resolvedSearchParams.space === 'code' ? 'code' : 'storage';

  return (
    <main className='space-y-6'>
      <section className='sticky top-[78px] z-30'>
        <SpaceSwitcher workspaceKey={key} currentSpace={activeSpace} />
      </section>

      {activeSpace === 'storage' ? (
        <>
          <section className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr]'>
            <Card className='border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg'>
              <CardHeader>
                <Badge className='w-fit rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'>Storage Space</Badge>
                <CardTitle className='text-3xl'>Your storage dashboard</CardTitle>
                <CardDescription>
                  Focused file area for uploads, storage tracking, and sharing.
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
                <Link href='/' className='font-medium text-foreground transition-colors hover:text-primary'>Home</Link>
                <span>/</span>
                <span className='font-medium text-foreground'>{key}</span>
              </CardContent>
              <CardContent className='pt-0'>
                <WorkspaceQuickActions workspaceKey={key} currentSpace='storage' />
              </CardContent>
              <CardContent className='pt-4'>
                <div className='grid gap-2 sm:grid-cols-3'>
                  <div className='rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground'>
                    Files expires in 24 hrs
                  </div>
                  <div className='rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground'>
                    Upload supports multi-file drag drop
                  </div>
                  <div className='rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground'>
                    Use Analysis for retention trends
                  </div>
                </div>
              </CardContent>
            </Card>
            <Suspense fallback={<Skeleton className='h-[120px] rounded-2xl'/>}>
              <StorageOverview uploadKey={key} />
            </Suspense>
          </section>

            <section id="upload" className="scroll-mt-24">
              <UploadCard uploadKey={key}/>
            </section>

            <section id="files" className='scroll-mt-24 space-y-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h2 className='text-2xl font-semibold tracking-tight'>Files</h2>
                    <p className='text-sm text-muted-foreground'>Latest uploads for key {key}</p>
                </div>
              </div>
              <div className='rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm sm:p-6'>
                <Suspense fallback={<Skeleton className='file_skeleton'/>}>
                      <UserFiles uploadKey={key}/>
                </Suspense>
              </div>
            </section>
        </>
      ) : (
        <>
          <CodeSpaceGuard workspaceKey={key}>
            <section>
              <Card className='border-border/50 bg-gradient-to-br from-emerald-500/12 via-card to-card/95 shadow-lg'>
                <CardHeader>
                  <Badge className='w-fit rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/35 font-semibold'>Code Space</Badge>
                  <CardTitle className='text-3xl'>Your code snippets dashboard</CardTitle>
                  <CardDescription>
                    A separate workspace for notes, snippets, and quick text workflows.
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
                  <Link href='/' className='font-medium text-foreground transition-colors hover:text-primary'>Home</Link>
                  <span>/</span>
                  <span className='font-medium text-foreground'>{key}</span>
                </CardContent>
                <CardContent className='pt-0'>
                  <WorkspaceQuickActions workspaceKey={key} currentSpace='code' />
                </CardContent>
                <CardContent className='pt-4'>
                  <div className='grid gap-2 sm:grid-cols-3'>
                    <div className='rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground'>
                      Notes expires in 10 days
                    </div>
                    <div className='rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground'>
                      Save manually to avoid accidental edits
                    </div>
                    <div className='rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground'>
                      Search quickly across all notes
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id='codespace' className='scroll-mt-24'>
              <CodeSpacePanel workspaceKey={key} />
            </section>
          </CodeSpaceGuard>
        </>
      )}
    </main>
  )
}

export default page
