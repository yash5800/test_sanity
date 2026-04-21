import React from 'react'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import ScrollToTopButton from '../components/ScrollToTopButton'
import { Metadata } from 'next';

export const metadata: Metadata = {
   title: {
      default:"SanityHub",
      template:"%s | SanityHub"
   },
   description: "SanityHub to Store",
 };

interface Entity{
   children:React.ReactNode,
   // params?:{id:string}
}

const layout = async ({children}: Entity) => {

  return (
<div className='relative flex min-h-screen flex-col overflow-hidden'>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_24%),radial-gradient(circle_at_top_right,hsl(var(--chart-2)/0.12),transparent_22%),radial-gradient(circle_at_bottom,hsl(var(--chart-4)/0.1),transparent_28%)]" />
          <div className="bg-glow">
            <div className="glow-orb glow-orb-1" />
            <div className="glow-orb glow-orb-2" />
            <div className="glow-orb glow-orb-3" />
          </div>
         <Hero />
         <main className='mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-8 sm:px-6 lg:px-8'>
            {children}
         </main>
         <Footer/>
         <ScrollToTopButton />
    </div>
  )

}

export default layout
