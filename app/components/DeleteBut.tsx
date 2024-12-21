'use client'
import { client } from '@/sanity/lib/client';
import React, { useState } from 'react'

const DeleteBut = ({fileId}:{fileId:string}) => {
  const [isload,setload] = useState(false);
  const deleteUploadedFile = async (fileId: string): Promise<void> => {
                                                  setload(true);
                                                   try {
                                                     const result = await client.delete(fileId); // Delete by _id
                                                     console.log('File deleted successfully:', result);
                                                     setload(false);
                                                     alert('File deleted successfully');
                                                   } catch (error) {
                                                     console.error('Error deleting file:', error);
                                                     throw error;
                                                   }
                                                 };
  return (
       <button
         onClick={()=>deleteUploadedFile(fileId)}
         className='text-green-500 mybut1'>
         {isload?"Loading..":"Delete"}
       </button>
  )
}

export default DeleteBut
