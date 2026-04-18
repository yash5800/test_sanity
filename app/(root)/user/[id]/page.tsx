import UploadCard from '@/app/components/UploadCard'
import UserFiles from '@/app/components/UserFiles'
import WorkspaceQuickActions from '@/app/components/WorkspaceQuickActions';
import StorageOverview from '@/app/components/StorageOverview';
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
}:{
  params:Promise<{id:string}>;
}) => {
  const key = (await params).id

  return (
    <main className='space-y-6'>
       <section className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr]'>
          <Card className='border-border/70 bg-card/80 shadow-sm'>
            <CardHeader>
              <Badge className='w-fit rounded-full bg-secondary text-secondary-foreground'>Workspace</Badge>
              <CardTitle className='text-3xl'>Your file dashboard</CardTitle>
              <CardDescription>
                Manage uploads for the current key, keep an eye on storage, and share files from one place.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
              <Link href='/' className='font-medium text-foreground transition-colors hover:text-primary'>Home</Link>
              <span>/</span>
              <span className='font-medium text-foreground'>{key}</span>
            </CardContent>
            <CardContent className='pt-0'>
              <WorkspaceQuickActions workspaceKey={key} />
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
    </main>
  )
}

export default page
