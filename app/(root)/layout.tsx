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

const layout:React.FC<Entity> =async ({children}) => {

  return (
   <div className='flex flex-col h-screen justify-between items-center '>
      <Hero />
      {children}
      <Footer/>
   </div>
  )

}

export default layout
