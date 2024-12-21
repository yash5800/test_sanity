'use client'
import React, { useState } from 'react'

const DownloadBut = ({file}:{file:{filename:string,fileUrl:string}}) => {
  const [isload,setload] = useState(false);
  return (
         <a
         href={file.fileUrl}
         download={file.filename}
         onClick={()=>setload(true)}
         target='_blank'
         className='text-green-500 mybut2'
         >
            {isload?"Loading..":"Download"}
        </a>
  )
}

export default DownloadBut
