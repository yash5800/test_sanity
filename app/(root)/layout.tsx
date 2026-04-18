import React from 'react'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
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
         <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_28%),radial-gradient(circle_at_bottom_right,hsl(var(--chart-2)/0.12),transparent_24%)]" />
         <Hero />
         <main className='mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
            {children}
         </main>
         <Footer/>
    </div>
  )

}

export default layout
