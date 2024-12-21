import React from 'react'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

type Params ={
  children:React.ReactNode,
  param:{id:string}
}

const layout:React.FC<Params> =async ({children}) => {

  return (
     <div className='flex flex-col h-screen justify-between items-center'>
        <Hero />
        {children}
        <Footer/>
     </div>
  )
}

export default layout
