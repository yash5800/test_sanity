'use client'
import { useToast } from '@/hooks/use-toast';
import { client } from '@/sanity/lib/client';
import React, { useState } from 'react'

const DeleteBut = ({fileId}:{fileId:string}) => {
  const [isload,setload] = useState(false);
  const {toast} = useToast();
  const deleteUploadedFile = async (fileId: string): Promise<void> => {
                                                  setload(true);
                                                   try {
                                                     const result = await client.delete(fileId); // Delete by _id
                                                     console.log('File deleted successfully:', result);
                                                     setload(false);
          
                                                     toast({
                                                      title: 'success',
                                                      description : "File deleted successfully",
                       
                                                    })
                                                   } catch (error) {
                                                    toast({
                                                      title: 'Error',
                                                      description : `Error deleting file ${error} and try again`,
                                                    })
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
