import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { QUERY } from '@/sanity/lib/query'
import React from 'react'
import DeleteBut from './DeleteBut'
import Image from 'next/image'
import DownloadBut from './DownloadBut'

const UserFiles = async({uploadKey}:{uploadKey:string}) => {

interface ItemContain{
  key:string,
  filename:string,
  fileUrl:string,
  _createdAt:string,
  _id:string
}
  const params = {search:uploadKey||null}
  const {data:post} = await sanityFetch({query:QUERY,params}) 

  return (
    <>

      <div className={`${post.length>0&&'card_grid'} mt-5`}>
        {post.length>0?
          (post.map((item:ItemContain,index:number)=>(
            <div key={index} className='flex flex-col gap-5 w-[280px] h-[180px] bg-white rounded-md text-black p-3 text-center'>
               <h1 className='text-lg font-semibold truncate'>{item.filename}</h1>
               <div className='flex justify-around items-center'>
                   <DownloadBut file={{filename:item.filename,fileUrl:item.fileUrl}} />
                   <DeleteBut fileId={item._id} />
                   
               </div>
               <div className='flex justify-center items-center gap-3'>
                  <Image src='/timer.png' alt='timerlogo' width={23} height={23} />
                  <p>{new Date(item._createdAt).toLocaleDateString('en-US',{
                            month:'long',
                            day:'numeric',
                            year:'numeric'
                          })}
                  </p>
               </div>
            </div>
          )))
          :(
            <h1 className='text-slate-500 '>Looks Like Empty</h1>
          )
        }
      </div>
       <SanityLive/>
    </>
    
  )
}

export default UserFiles
