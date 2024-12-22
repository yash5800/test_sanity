import Ativee from '@/app/components/Ativee';
import UploadCard from '@/app/components/UploadCard'
import UserFiles from '@/app/components/UserFiles'
import { Skeleton } from '@/app/components/ui/skeleton';
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
          <Ativee />
       </section>
       <section>
           <UploadCard uploadKey={key}/>
       </section>
       <section >
           <div className='text-gray-600 font-semibold text-xl mt-12 mb-12'>
             <h1 className='ml-6'>
                <a href='../'><span     className='text-gray-600 p-2.5 rounded-md hover:bg-gray-900      hover:text-gray-400'>Home</span>{' > '}</    a>
                <a href='#'><span     className='text-gray-600 p-2.5 rounded-md hover:bg-gray-900      hover:text-gray-400'>{`${key}`}</span>{'     > '}</a>
                <a href='#files'><span     className='text-gray-600 p-2.5 rounded-md hover:bg-gray-900    hover:text-gray-400'>Files</span></a>
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
