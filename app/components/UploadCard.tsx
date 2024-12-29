'use client'
import { useToast } from '@/hooks/use-toast';
import { uploadToSanity } from '@/sanity/lib/upload'
import React, { useState } from 'react'

const UploadCard = ({uploadKey}:{uploadKey:string}) => {
  const [isUploading,setUploading] = useState(false);
  const {toast} = useToast();

  console.log("current uploadKey: " + uploadKey);

  const handleOnClick=()=>{
     const upIn = document.getElementById("file")as HTMLInputElement;
     if (upIn){
       upIn.click();
     }
  }

  const handleFileChange = async (e : React.ChangeEvent<HTMLInputElement>)=>{
      if(e.target.files){
        const selectfile = e.target.files[0];
        await handleFileUpload(selectfile);
      }
  }
  
  const handleFileUpload= async(file:File)=>{
        if(!uploadKey||!file){
          alert("Please upload a file");
          return;
        }
        try{
          setUploading(true);
          const result = await uploadToSanity(uploadKey,file);
          
          toast({
            title:"success",
            description:"File uploaded successfully!",
            variant:"success",
          })

          console.log("revived : ",result);
          setUploading(false);
        }
        catch (e: unknown) {
          console.error("File upload error:", e); 
          if (e instanceof Error) {
            toast({
              title: 'Error',
              description : `File upload failed: ${e.message} try again later`,
              variant:"destructive"
            })
          } else {
            toast({
              title: 'Error',
              description : "File upload failed due to an unknown error",
              variant:"destructive"
            })
          }
          setUploading(false);
        }
        
  }

  return (
    <div className='mycard1'>
       <h1 className='max-sm:text-xl text-3xl font-bold text-white'>Select File</h1>
       <input 
         id='file'
         type="file" 
         onChange={handleFileChange}
       />
       <button className='mybut3' onClick={handleOnClick}>
         {isUploading?"Uploading..":"Choose and Upload"}
       </button>
       
    </div>
  )
}

export default UploadCard
