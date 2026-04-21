'use client'

import React from 'react'
import Key from '../components/Key'
import { Card, CardContent } from '@/app/components/ui/card'
import { LockKeyhole, ArrowDown } from 'lucide-react'
import { Button } from '@/app/components/ui/button'


const page = () => {
  const scrollToCard = () => {
    const element = document.getElementById('access-key-card')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <section className='animate-enter grid items-start gap-6 md:gap-8 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr] px-4 sm:px-6 lg:px-0'>
        {/* Left Content */}
        <div className='space-y-6 sm:space-y-8'>
          <div className='animate-enter space-y-4 sm:space-y-6' style={{ animationDelay: '70ms' }}>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight'>
              Upload, search, and manage files in a <span className='bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>private workspace</span>.
            </h1>
            <p className='max-w-xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed'>
              Clean surfaces, quick access, and a simple workflow for private file management. No complications, no distractions.
            </p>
          </div>

          <div className='animate-enter' style={{ animationDelay: '120ms' }}>
            <Button
              onClick={scrollToCard}
              className='md:hidden h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700'
            >
              <ArrowDown className='h-4 w-4' />
              Go to secure access
            </Button>
          </div>

          {/* Info Card */}
          <Card className='hover-lift animate-enter border-border/50 bg-gradient-to-br from-blue-500/10 to-purple-500/5 shadow-lg' style={{ animationDelay: '140ms' }}>
            <CardContent className='flex items-start gap-4 p-5 sm:p-6'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 flex-shrink-0'>
                <LockKeyhole className='h-5 w-5' />
              </div>
              <div className='space-y-1'>
                <p className='font-semibold text-foreground'>Secure & Private</p>
                <p className='text-sm text-muted-foreground'>Access is key-based. If someone gets your key, they can access your workspace.</p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid - Desktop Only */}
          <div className='hidden md:grid grid-cols-2 gap-4 pt-4'>
            <div className='flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors'>
              <div className='h-2 w-2 rounded-full bg-blue-500' />
              <span className='text-sm font-medium'>Zero middlemen</span>
            </div>
            <div className='flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors'>
              <div className='h-2 w-2 rounded-full bg-purple-500' />
              <span className='text-sm font-medium'>Full control</span>
            </div>
            <div className='flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors'>
              <div className='h-2 w-2 rounded-full bg-pink-500' />
              <span className='text-sm font-medium'>Fast & reliable</span>
            </div>
            <div className='flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 transition-colors'>
              <div className='h-2 w-2 rounded-full bg-blue-500' />
              <span className='text-sm font-medium'>Multi-file ready</span>
            </div>
          </div>
        </div>

        {/* Right - Key Card */}
        <div id='access-key-card' className='animate-enter lg:sticky lg:top-32 w-full' style={{ animationDelay: '220ms' }}>
          <Key />
        </div>
      </section>
    </>
  )
}

export default page
