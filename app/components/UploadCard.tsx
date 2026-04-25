'use client'
import { useToast } from '@/hooks/use-toast';
import { MAX_UPLOAD_SIZE_BYTES, uploadManyToSanity } from '@/sanity/lib/upload'
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { FileUp, ImagePlus, Loader2, Sparkles, UploadCloud } from 'lucide-react'

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

const UPLOAD_STATE_KEY = 'sanityhub:upload-state';

type PersistedUploadState = {
  uploadKey: string;
  isUploading: boolean;
  selectedCount: number;
  uploadProgress: number;
  activeFileName: string | null;
  activeFileSize: number;
  loadedBytes: number;
  totalBytes: number;
  updatedAt: number;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const UploadCard = ({uploadKey}:{uploadKey:string}) => {
  const [isUploading,setUploading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [activeFileSize, setActiveFileSize] = useState<number>(0);
  const [loadedBytes, setLoadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setTabHidden] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const {toast} = useToast();

  const persistUploadState = (state: PersistedUploadState) => {
    try {
      sessionStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(state));
    } catch {
      // no-op if storage is unavailable
    }
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(UPLOAD_STATE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedUploadState;
      if (parsed.uploadKey !== uploadKey) return;

      setUploading(parsed.isUploading);
      setSelectedCount(parsed.selectedCount);
      setUploadProgress(parsed.uploadProgress);
      setActiveFileName(parsed.activeFileName);
      setActiveFileSize(parsed.activeFileSize);
      setLoadedBytes(parsed.loadedBytes);
      setTotalBytes(parsed.totalBytes);
    } catch {
      // ignore invalid persisted upload state
    }
  }, [uploadKey]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isUploading) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [isUploading]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const hidden = document.visibilityState === 'hidden';
      setTabHidden(hidden);
    };

    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

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

        const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_SIZE_BYTES);

        if (oversizedFile) {
          toast({
            title: 'Error',
            description: `${oversizedFile.name} is larger than 1 GB`,
            variant: 'destructive',
          });
          return;
        }

        try{
          setUploading(true);
          setUploadProgress(0);
          setActiveFileName(files[0]?.name ?? null);
          setActiveFileSize(files[0]?.size ?? 0);
          setLoadedBytes(0);
          setTotalBytes(files.reduce((sum, file) => sum + file.size, 0));

          persistUploadState({
            uploadKey,
            isUploading: true,
            selectedCount: files.length,
            uploadProgress: 0,
            activeFileName: files[0]?.name ?? null,
            activeFileSize: files[0]?.size ?? 0,
            loadedBytes: 0,
            totalBytes: files.reduce((sum, file) => sum + file.size, 0),
            updatedAt: Date.now(),
          });

          await uploadManyToSanity(uploadKey, files, ({ percent, file, loadedBytes: loaded, totalBytes: total }) => {
            setUploadProgress(percent);
            setActiveFileName(file.name);
            setActiveFileSize(file.size);
            setLoadedBytes(loaded);
            setTotalBytes(total);

            persistUploadState({
              uploadKey,
              isUploading: true,
              selectedCount: files.length,
              uploadProgress: percent,
              activeFileName: file.name,
              activeFileSize: file.size,
              loadedBytes: loaded,
              totalBytes: total,
              updatedAt: Date.now(),
            });
          });
          
          setUploadProgress(100);
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          toast({
            title:"success",
            description:`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`,
            variant:"success",
          })
          router.refresh();
          setSelectedCount(0);
          setUploading(false);

          persistUploadState({
            uploadKey,
            isUploading: false,
            selectedCount: 0,
            uploadProgress: 100,
            activeFileName: null,
            activeFileSize: 0,
            loadedBytes: 0,
            totalBytes: 0,
            updatedAt: Date.now(),
          });
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

          persistUploadState({
            uploadKey,
            isUploading: false,
            selectedCount: 0,
            uploadProgress: 0,
            activeFileName: null,
            activeFileSize: 0,
            loadedBytes: 0,
            totalBytes: 0,
            updatedAt: Date.now(),
          });
        } finally {
          setActiveFileName(null);
          setLoadedBytes(0);
          setTotalBytes(0);
          setUploadProgress(0);
        }
        
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg shadow-black/20 backdrop-blur-xl rounded-xl">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Upload file
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
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
           isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-border/70 bg-background/60'
         } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
       >
         <div className='flex flex-col items-center gap-3 text-center'>
           <div className='rounded-full border border-border/80 bg-card/80 p-2'>
             {isUploading ? <Loader2 className='h-5 w-5 animate-spin text-blue-600 dark:text-blue-400' /> : <FileUp className='h-5 w-5 text-blue-600 dark:text-blue-400' />}
           </div>
           <div className='space-y-1'>
             <p className='text-sm font-medium'>
               {isUploading ? 'Uploading files...' : 'Drag and drop files here'}
             </p>
             <p className='text-xs text-muted-foreground'>
               or use the button below to choose files
             </p>
           </div>
           <Button className="h-10 rounded-xl px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold" onClick={handleOnClick} type="button" disabled={isUploading}>
             {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
             {isUploading ? "Uploading..." : "Choose files"}
           </Button>
         </div>
       </div>
       {isUploading ? (
         <div className="space-y-3 rounded-[1.25rem] border border-border/70 bg-background/70 p-4 shadow-sm">
           <div className="flex items-center justify-between gap-3 text-sm">
             <span className="font-medium">Uploading files</span>
             <div className="flex items-center gap-2 text-muted-foreground">
               {activeFileSize > 0 && (
                 <span className="text-xs">{formatBytes(activeFileSize)}</span>
               )}
               <span>{uploadProgress}%</span>
             </div>
           </div>
           <div className="h-2 overflow-hidden rounded-full bg-muted">
             <div
               className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
               style={{ width: `${uploadProgress}%` }}
             />
           </div>
           <div className='flex items-center justify-between text-xs text-muted-foreground'>
             <p>
               {activeFileName ? `Working on ${activeFileName}` : 'Preparing your files for upload'}
             </p>
             {loadedBytes > 0 && totalBytes > 0 && (
               <span className='font-medium text-foreground'>
                 {formatBytes(loadedBytes)} / {formatBytes(totalBytes)}
               </span>
             )}
           </div>
           {isTabHidden ? (
             <p className='text-xs text-amber-400'>
               Upload is still running in background tab. Keep this tab open until completion.
             </p>
           ) : null}
           <p className='text-xs text-muted-foreground'>
             Avoid hard refresh during upload. Progress UI is restored on route/tab changes.
           </p>
         </div>
       ) : null}
       <div className='flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-gradient-to-r from-blue-500/8 via-background to-purple-500/8 p-3 text-sm text-muted-foreground'>
         <ImagePlus className='h-4 w-4 text-blue-600 dark:text-blue-400' />
         <p>
           {selectedCount > 0 ? `${selectedCount} file${selectedCount > 1 ? 's' : ''} selected` : 'You can select multiple files at once'}
         </p>
       </div>
      </CardContent>
    </Card>
  )
}

export default UploadCard
