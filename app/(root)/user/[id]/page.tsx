import UploadCard from '@/app/components/UploadCard'
import UserFiles from '@/app/components/UserFiles'
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTotalStorageUsed } from '@/sanity/lib/Store'
import { Metadata } from 'next';
import React, { Suspense } from 'react'

export const metadata: Metadata = {
  title: "Files" ,
  description: "SanityHub to Store",
};

const page = async ({params}:{params:Promise<{id:string}>}) => {
  const key = (await params).id
  console.log(key)
  return (
    <main className='flex flex-col mt-5 justify-center items-center'>
       <section>
          <div className='flex justify-center items-center gap-2 p-2 mt-3 mb-3'>
            <h1 className='max-sm:text-base text-xl font-sans text-gray-500 '>Current Server Storage</h1>
            <Suspense fallback={<Skeleton className='store_skeleton_tag'/>}>
             <span className='text-green-600 font-mono'>{fetchTotalStorageUsed()} MB</span>
            </Suspense>
          </div>
       </section>
       <section>
           <UploadCard uploadKey={key}/>
       </section>
       <section >
           <div className='text-gray-600 font-semibold text-2xl mt-12 mb-12'>
             <h1 className='ml-6'>
                <a href='../'><span     className='text-gray-600 hover:underline     hover:text-gray-400'>Home</span>{' > '}</    a>
                <a href='#'><span     className='text-gray-600 hover:underline     hover:text-gray-400'>{`${key}`}</span>{'     > '}</a>
                <a href='#files'><span     className='text-gray-600 hover:underline     hover:text-gray-400'>Files</span></a>
             </h1>
           </div>
           <div id="files" className='rounded-xl max-sm:p-5 max-xl:p-10 p-20 mb-20 text-center relative'>
           <Suspense fallback={<Skeleton className='file_skeleton'/>}>
             <UserFiles uploadKey={key}/>
           </Suspense>
             
           </div>
       </section>
    </main>
  )
}

export default page
