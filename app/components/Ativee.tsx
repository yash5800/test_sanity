import Image from 'next/image';
import React, { Suspense } from 'react'
import { Skeleton } from './ui/skeleton';
import { fetchTotalStorageUsed } from '@/sanity/lib/Store';

const Ativee = () => {
  return (
    <div className='py-10'>
        <div className='relative group'>
          <div className="absolute -inset-0.5 opacity-75 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200
          animate-tilt
          "></div>
           <button className='max-sm:px-5 max-sm:py-2 px-7 py-4 bg-black    rounded-lg leading-none flex items-center relative space-x-3 max-sm:space-x-2'>
             <span className="flex item-center    space-x-5">
               <Image src={"/clock.png"} alt='time'  width={20} height={20} />
             </span>
             <span className='text-indigo-400    font-mono'>Server Storage Used</span>
             <Suspense fallback={<Skeleton className='store_skeleton_tag'/>}>
             <span className='text-green-700 font-mono group-hover:text-green-600 transition duration-200'>{fetchTotalStorageUsed()} MB</span>
            </Suspense>
           </button>
        </div>
    </div>
  )
}

export default Ativee
