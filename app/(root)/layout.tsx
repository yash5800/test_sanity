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

const layout =async ({children}:{children:React.ReactNode}) => {

  return (
     <div className='flex flex-col h-screen justify-between items-center '>
        <Hero />
        {children}
        <Footer/>
     </div>
  )
}

export default layout
