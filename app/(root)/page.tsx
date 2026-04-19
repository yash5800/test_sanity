import React from 'react'
import Key from '../components/Key'
import { Card, CardContent } from '@/app/components/ui/card'
import { LockKeyhole } from 'lucide-react'


const page = async () => {

  return (
       <section className='animate-enter grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]'>
         <div className='space-y-6'>
           <div className='animate-enter space-y-4' style={{ animationDelay: '70ms' }}>
             <h1 className='max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl'>
               Upload, search, and manage files in a private workspace.
             </h1>
             <p className='max-w-xl text-base text-muted-foreground sm:text-lg'>
               Clean surfaces, quick access, and a simple workflow for private file management.
             </p>
           </div>

           <Card className='hover-lift animate-enter max-w-xl border-border/70 bg-card/90 shadow-lg shadow-black/10' style={{ animationDelay: '140ms' }}>
             <CardContent className='flex items-center gap-3 p-4 text-sm text-muted-foreground'>
               <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/80 text-secondary-foreground'>
                 <LockKeyhole className='h-4 w-4' />
               </div>
               <span>Enter your key to open the workspace and start uploading.</span>
             </CardContent>
           </Card>
         </div>

         <div id='access' className='animate-enter' style={{ animationDelay: '220ms' }}>
           <Key />
         </div>
       </section>
  )
}

export default page
