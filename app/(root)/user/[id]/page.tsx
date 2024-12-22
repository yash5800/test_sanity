import UploadCard from '@/app/components/UploadCard'
import UserFiles from '@/app/components/UserFiles'
import { fetchTotalStorageUsed } from '@/sanity/lib/Store'
import { Metadata } from 'next';
import React from 'react'

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
          <h1 className='max-sm:text-base text-xl font-sans mt-3 mb-3 text-gray-300 opacity-60 hover:opacity-100'>Current Server Storage <span className='text-green-500 font-mono'>{fetchTotalStorageUsed()} MB</span></h1>
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
           <div id="files" className='rounded-xl max-sm:p-5 max-xl:p-10 p-20 mb-20'>
              <UserFiles uploadKey={key}/>
           </div>
       </section>
    </main>
  )
}

export default page
