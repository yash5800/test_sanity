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
          <h1 className='max-sm:text-base text-xl font-sans mt-3 mb-3 text-gray-600 '>Current Server Storage <span className='text-green-800 font-mono'>{fetchTotalStorageUsed()} MB</span></h1>
       </section>
       <section>
           <UploadCard uploadKey={key}/>
       </section>
       <section >
           <UserFiles uploadKey={key}/>
       </section>
    </main>
  )
}

export default page
