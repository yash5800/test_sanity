'use client'
import { useToast } from '@/hooks/use-toast';
import { uploadManyToSanity } from '@/sanity/lib/upload'
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { FileUp, ImagePlus, Loader2, Sparkles, UploadCloud } from 'lucide-react'

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

const UploadCard = ({uploadKey}:{uploadKey:string}) => {
  const [isUploading,setUploading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const {toast} = useToast();

  const handleOnClick=()=>{
     inputRef.current?.click();
  }

  const handleSelectedFiles = async (files: File[]) => {
    setSelectedCount(files.length);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  }

  const handleFileChange = async (e : React.ChangeEvent<HTMLInputElement>)=>{
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      await handleSelectedFiles(selectedFiles);
      e.target.value = '';
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragging(true);
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) {
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files ?? []);
    await handleSelectedFiles(droppedFiles);
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
          router.refresh();
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
    <Card className="overflow-hidden border-border/70 bg-card/90 shadow-lg shadow-black/10 backdrop-blur">
      <div className="h-2 bg-gradient-to-r from-chart-2 via-primary to-chart-4" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UploadCloud className="h-5 w-5 text-primary" />
          Upload file
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-chart-4" />
          Pick a file and send it straight to your private storage bucket.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       <input 
         id='file'
         ref={inputRef}
         type="file" 
         className='hidden'
         multiple
         onChange={handleFileChange}
       />
       <div
         className={`rounded-[1.25rem] border border-dashed p-4 transition-colors sm:p-5 ${
           isDragging ? 'border-primary bg-primary/10' : 'border-border/70 bg-background/60'
         } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
       >
         <div className='flex flex-col items-center gap-3 text-center'>
           <div className='rounded-full border border-border/80 bg-card/80 p-2'>
             {isUploading ? <Loader2 className='h-5 w-5 animate-spin text-primary' /> : <FileUp className='h-5 w-5 text-primary' />}
           </div>
           <div className='space-y-1'>
             <p className='text-sm font-medium'>
               {isUploading ? 'Uploading files...' : 'Drag and drop files here'}
             </p>
             <p className='text-xs text-muted-foreground'>
               or use the button below to choose files
             </p>
           </div>
           <Button className="h-10 rounded-xl px-4" variant="secondary" onClick={handleOnClick} type="button" disabled={isUploading}>
             {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
             {isUploading ? "Uploading..." : "Choose files"}
           </Button>
         </div>
       </div>
       {isUploading ? (
         <div className="space-y-3 rounded-[1.25rem] border border-border/70 bg-background/70 p-4 shadow-sm">
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
       <div className='flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-gradient-to-r from-primary/8 via-background to-chart-2/8 p-3 text-sm text-muted-foreground'>
         <ImagePlus className='h-4 w-4 text-primary' />
         <p>
           {selectedCount > 0 ? `${selectedCount} file${selectedCount > 1 ? 's' : ''} selected` : 'You can select multiple files at once'}
         </p>
       </div>
      </CardContent>
    </Card>
  )
}

export default UploadCard
