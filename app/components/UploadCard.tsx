'use client'
import { useToast } from '@/hooks/use-toast';
import { uploadManyToSanity } from '@/sanity/lib/upload'
import React, { useState } from 'react'
import { FileUp, UploadCloud } from 'lucide-react'

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

const UploadCard = ({uploadKey}:{uploadKey:string}) => {
  const [isUploading,setUploading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const {toast} = useToast();

  const handleOnClick=()=>{
     const upIn = document.getElementById("file")as HTMLInputElement;
     if (upIn){
       upIn.click();
     }
  }

  const handleFileChange = async (e : React.ChangeEvent<HTMLInputElement>)=>{
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      setSelectedCount(selectedFiles.length);

      if (selectedFiles.length > 0) {
        await handleFileUpload(selectedFiles);
      }
  }
  
  const handleFileUpload= async(files:File[])=>{
        if(!uploadKey||files.length===0){
          toast({
            title: 'Error',
            description: 'Please choose at least one file',
            variant: 'destructive',
          })
          return;
        }
        try{
          setUploading(true);
          setUploadProgress(0);
          setActiveFileName(files[0]?.name ?? null);

          await uploadManyToSanity(uploadKey, files, ({ completed, total, file }) => {
            setUploadProgress(Math.round((completed / total) * 100));
            setActiveFileName(file.name);
          });
          
          toast({
            title:"success",
            description:`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`,
            variant:"success",
          })
          setSelectedCount(0);
          setUploadProgress(100);
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
        } finally {
          setActiveFileName(null);
        }
        
  }

  return (
    <Card className="border-border/70 bg-card/90 shadow-lg shadow-black/10 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UploadCloud className="h-5 w-5 text-primary" />
          Upload file
        </CardTitle>
        <CardDescription>Pick a file and send it straight to your private storage bucket.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       <input 
         id='file'
         type="file" 
         multiple
         onChange={handleFileChange}
       />
       <Button className="h-11 w-full rounded-xl" variant="secondary" onClick={handleOnClick} type="button" disabled={isUploading}>
         <FileUp className="h-4 w-4" />
         {isUploading ? "Uploading..." : "Choose and upload"}
       </Button>
       {isUploading ? (
         <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
           <div className="flex items-center justify-between gap-3 text-sm">
             <span className="font-medium">Uploading files</span>
             <span className="text-muted-foreground">{uploadProgress}%</span>
           </div>
           <div className="h-2 overflow-hidden rounded-full bg-muted">
             <div
               className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
               style={{ width: `${uploadProgress}%` }}
             />
           </div>
           <p className='text-xs text-muted-foreground'>
             {activeFileName ? `Working on ${activeFileName}` : 'Preparing your files for upload'}
           </p>
         </div>
       ) : null}
       <p className='text-sm text-muted-foreground'>
         {selectedCount > 0 ? `${selectedCount} file${selectedCount > 1 ? 's' : ''} selected` : 'You can select multiple files at once'}
       </p>
      </CardContent>
    </Card>
  )
}

export default UploadCard
