import React from 'react'
import Key from '../components/Key'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent } from '@/app/components/ui/card'


const page = async () => {

  return (
       <section className='grid items-start gap-8 lg:grid-cols-[1fr_0.95fr]'>
         <div className='space-y-4'>
           <Badge className='w-fit rounded-full bg-secondary text-secondary-foreground'>Simple file storage</Badge>
           <h1 className='max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl'>
             Upload, search, and manage your files with one key.
           </h1>
           <p className='max-w-lg text-sm text-muted-foreground sm:text-base'>
             Lightweight dashboard, multi-file upload, and theme toggle.
           </p>
           <Card className='max-w-lg border-border/70 bg-card/80 shadow-sm'>
             <CardContent className='p-4 text-sm text-muted-foreground'>
               Enter your key to open your file workspace.
             </CardContent>
           </Card>
         </div>

         <div id='access'>
           <Key />
         </div>
       </section>
  )
}

export default page
