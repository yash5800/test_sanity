import Image from 'next/image'
import React from 'react'

const Hero = () => {
  return (
  <>
    <div className='flex justify-center items-center bg-gray-900 text-gray-600 w-full p-6 gap-4'>
      <a href='../'><h1 className='max-sm:text-lg text-2xl font-extrabold'>Welcome to <span className='text-blue-700'>SanityHub</span></h1></a>        
      <a href='../'>
      <Image src={'/database.png'} alt='databaselogo' height={35} width={35}/></a>
    </div>
     
  </>
  )
}

export default Hero
