'use client'
import { useToast } from '@/hooks/use-toast';
import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_LABEL, uploadToSanity } from '@/sanity/lib/upload'
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { FileUp, ImagePlus, Loader2, Sparkles, UploadCloud, X } from 'lucide-react'

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  clearUploadSessionState,
  clearUploadQueueState,
  getUploadSessionState,
  getUploadQueueState,
  setUploadSessionState,
  setUploadQueueState,
  updateUploadQueueItem,
  subscribeUploadQueue,
  subscribeUploadSession,
  type UploadQueueItem,
} from './upload-session';

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
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const canceledFileIdsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);
  const handledCompletionAtRef = useRef<number | null>(null);
  const router = useRouter();
  const {toast} = useToast();

  const updateFileUpload = (id: string, updater: (item: UploadQueueItem) => UploadQueueItem) => {
    updateUploadQueueItem(uploadKey, id, updater);
  };

  const setAllFileUploads = (items: UploadQueueItem[]) => {
    setUploadQueueState(uploadKey, items);
  };

  const recordInterruptedUpload = () => {
    try {
      sessionStorage.setItem(
        'sanityhub:upload-interrupted',
        JSON.stringify({ uploadKey, updatedAt: Date.now() }),
      );
    } catch {
      // ignore storage errors
    }
  };

  const clearInterruptedUpload = () => {
    try {
      sessionStorage.removeItem('sanityhub:upload-interrupted');
    } catch {
      // ignore storage errors
    }
  };

  const uploadSession = useSyncExternalStore(
    subscribeUploadSession,
    () => getUploadSessionState(uploadKey),
    () => null,
  );

  const uploadQueue = useSyncExternalStore(
    subscribeUploadQueue,
    () => getUploadQueueState(uploadKey) ?? [],
    () => getUploadQueueState(uploadKey) ?? [],
  );

  useEffect(() => {
    if (!uploadSession) {
      setUploading(false);
      if (uploadQueue.length === 0) {
        setSelectedCount(0);
        setUploadProgress(0);
        setActiveFileName(null);
        setActiveFileSize(0);
        setLoadedBytes(0);
        setTotalBytes(0);
      }
      return;
    }

    if (uploadSession.phase === 'completed') {
      if (handledCompletionAtRef.current !== uploadSession.updatedAt) {
        handledCompletionAtRef.current = uploadSession.updatedAt;

        toast({
          title: 'success',
          description: `${uploadSession.selectedCount} file${uploadSession.selectedCount > 1 ? 's' : ''} uploaded successfully`,
          variant: 'success',
        });
        router.refresh();
        clearUploadQueueState(uploadKey);
      }

      clearUploadSessionState(uploadKey);
      return;
    }

    setUploading(uploadSession.isUploading);
    setSelectedCount(uploadSession.selectedCount);
    setUploadProgress(uploadSession.uploadProgress);
    setActiveFileName(uploadSession.activeFileName);
    setActiveFileSize(uploadSession.activeFileSize);
    setLoadedBytes(uploadSession.loadedBytes);
    setTotalBytes(uploadSession.totalBytes);
  }, [uploadQueue.length, uploadKey, uploadSession, router, toast]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sanityhub:upload-interrupted');
      if (!raw) return;

      const parsed = JSON.parse(raw) as { uploadKey?: string; updatedAt?: number };
      if (parsed.uploadKey !== uploadKey) return;

      clearInterruptedUpload();
      toast({
        title: 'Error',
        description: 'Upload was interrupted by a reload or tab close. Please upload the file again.',
        variant: 'destructive',
      });
    } catch {
      clearInterruptedUpload();
    }
  }, [toast, uploadKey]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const onPageHide = () => {
      if (!isUploading) return;
      recordInterruptedUpload();
    };

    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
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

  const handleFileUpload = async (files: File[]) => {
    if (!uploadKey || files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please choose at least one file',
        variant: 'destructive',
      });
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_SIZE_BYTES);

    if (oversizedFile) {
      toast({
        title: 'Error',
        description: `${oversizedFile.name} is larger than ${MAX_UPLOAD_SIZE_LABEL}`,
        variant: 'destructive',
      });
      return;
    }

    const initialFileUploads = files.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}-${Date.now()}`,
      file,
      status: 'queued' as const,
      progress: 0,
      loadedBytes: 0,
      totalBytes: file.size,
    }));

    handledCompletionAtRef.current = null;
    canceledFileIdsRef.current = new Set();
    setAllFileUploads(initialFileUploads);
    setSelectedCount(files.length);
    setUploading(true);
    setUploadProgress(0);
    setActiveFileName(initialFileUploads[0]?.file.name ?? null);
    setActiveFileSize(initialFileUploads[0]?.file.size ?? 0);
    setLoadedBytes(0);
    setTotalBytes(files.reduce((sum, file) => sum + file.size, 0));
    clearInterruptedUpload();

    setUploadSessionState({
      uploadKey,
      phase: 'uploading',
      isUploading: true,
      selectedCount: files.length,
      uploadProgress: 0,
      activeFileName: initialFileUploads[0]?.file.name ?? null,
      activeFileSize: initialFileUploads[0]?.file.size ?? 0,
      loadedBytes: 0,
      totalBytes: files.reduce((sum, file) => sum + file.size, 0),
      updatedAt: Date.now(),
    });

    let completedBytes = 0;

    try {
      for (const item of initialFileUploads) {
        if (canceledFileIdsRef.current.has(item.id)) {
          updateFileUpload(item.id, (current) => ({ ...current, status: 'canceled', progress: 0 }));
          continue;
        }

        if (!isMountedRef.current) {
          break;
        }

        uploadAbortControllerRef.current = new AbortController();

        updateFileUpload(item.id, (current) => ({ ...current, status: 'uploading' }));

        setActiveFileName(item.file.name);
        setActiveFileSize(item.file.size);

        setUploadSessionState({
          uploadKey,
          phase: 'uploading',
          isUploading: true,
          selectedCount: files.length,
          uploadProgress: completedBytes > 0 ? Math.min(100, Math.round((completedBytes / files.reduce((sum, file) => sum + file.size, 0)) * 100)) : 0,
          activeFileName: item.file.name,
          activeFileSize: item.file.size,
          loadedBytes: completedBytes,
          totalBytes: files.reduce((sum, file) => sum + file.size, 0),
          updatedAt: Date.now(),
        });

        try {
          const uploadedDocument = await uploadToSanity(
            uploadKey,
            item.file,
            ({ loadedBytes, totalBytes, percent }) => {
              const currentLoadedBytes = completedBytes + loadedBytes;
              const currentTotalBytes = files.reduce((sum, file) => sum + file.size, 0);
              const currentPercent = currentTotalBytes > 0 ? Math.min(100, Math.round((currentLoadedBytes / currentTotalBytes) * 100)) : percent;

              updateFileUpload(item.id, (current) => ({
                ...current,
                status: 'uploading',
                progress: percent,
                loadedBytes,
                totalBytes,
              }));

              setUploadProgress(currentPercent);
              setLoadedBytes(currentLoadedBytes);
              setTotalBytes(currentTotalBytes);

              setUploadSessionState({
                uploadKey,
                phase: 'uploading',
                isUploading: true,
                selectedCount: files.length,
                uploadProgress: currentPercent,
                activeFileName: item.file.name,
                activeFileSize: item.file.size,
                loadedBytes: currentLoadedBytes,
                totalBytes: currentTotalBytes,
                updatedAt: Date.now(),
              });
            },
            uploadAbortControllerRef.current.signal,
          );

          void uploadedDocument;

          completedBytes += item.file.size;
          updateFileUpload(item.id, (current) => ({
            ...current,
            status: 'uploaded',
            progress: 100,
            loadedBytes: item.file.size,
            totalBytes: item.file.size,
          }));
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            updateFileUpload(item.id, (current) => ({
              ...current,
              status: 'canceled',
              progress: 0,
              loadedBytes: 0,
              totalBytes: item.file.size,
            }));
            canceledFileIdsRef.current.add(item.id);
            continue;
          }

          throw error;
        }
      }

      const finalQueue = getUploadQueueState(uploadKey) ?? initialFileUploads;
      const uploadedFiles = finalQueue.filter((entry) => entry.status === 'uploaded').length;
      const canceledFiles = finalQueue.filter((entry) => entry.status === 'canceled').length;

      if (canceledFiles === 0) {
        setUploadSessionState({
          uploadKey,
          phase: 'completed',
          isUploading: false,
          selectedCount: uploadedFiles,
          uploadProgress: 100,
          activeFileName: null,
          activeFileSize: 0,
          loadedBytes: completedBytes,
          totalBytes: files.reduce((sum, file) => sum + file.size, 0),
          updatedAt: Date.now(),
        });

        if (isMountedRef.current) {
          setSelectedCount(0);
          setUploading(false);
        }
      } else {
        clearUploadSessionState(uploadKey);

        if (isMountedRef.current) {
          setUploading(false);
        }

        if (uploadedFiles > 0) {
          toast({
            title: 'Partial upload',
            description: `${uploadedFiles} file${uploadedFiles > 1 ? 's' : ''} uploaded, ${canceledFiles} canceled.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Canceled',
            description: 'Upload canceled.',
            variant: 'destructive',
          });
        }
      }

      clearInterruptedUpload();
      uploadAbortControllerRef.current = null;
    } catch (e: unknown) {
      const wasCanceled = e instanceof DOMException && e.name === 'AbortError';

      if (wasCanceled) {
        toast({
          title: 'Canceled',
          description: 'Upload canceled.',
          variant: 'destructive',
        });
      } else if (e instanceof Error) {
        toast({
          title: 'Error',
          description: `File upload failed: ${e.message} try again later`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'File upload failed due to an unknown error',
          variant: 'destructive',
        });
      }

      if (isMountedRef.current) {
        setUploading(false);
      }

      clearInterruptedUpload();
      clearUploadSessionState(uploadKey);

      uploadAbortControllerRef.current = null;
    } finally {
      if (!isMountedRef.current) {
        return;
      }

      setActiveFileName(null);
      setLoadedBytes(0);
      setTotalBytes(0);
      setUploadProgress(0);
    }
  }

  const handleCancelFile = (fileId: string) => {
    const fileItem = uploadQueue.find((item) => item.id === fileId);

    if (!fileItem) {
      return;
    }

    if (fileItem.status === 'uploading') {
      uploadAbortControllerRef.current?.abort();
      return;
    }

    canceledFileIdsRef.current.add(fileId);

    updateFileUpload(fileId, (current) => ({ ...current, status: 'canceled', progress: 0 }));
  };

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
         } ${isUploading ? 'opacity-80' : ''}`}
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
               <span>{uploadProgress}%</span>
             </div>
           </div>
           <div className='space-y-2'>
             {uploadQueue.map((item) => {
               const isActive = item.status === 'uploading';
               const isDone = item.status === 'uploaded';
               const isCanceled = item.status === 'canceled';

               return (
                 <div key={item.id} className='rounded-2xl border border-border/70 bg-background/80 p-3'>
                   <div className='flex items-start justify-between gap-3'>
                     <div className='min-w-0'>
                       <p className='truncate text-sm font-medium'>{item.file.name}</p>
                       <p className='text-xs text-muted-foreground'>{formatBytes(item.file.size)}</p>
                     </div>
                     <div className='flex items-center gap-2'>
                       <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${isDone ? 'bg-emerald-500/15 text-emerald-500' : isCanceled ? 'bg-muted text-muted-foreground' : isActive ? 'bg-blue-500/15 text-blue-500' : 'bg-amber-500/15 text-amber-500'}`}>
                         {isDone ? 'Uploaded' : isCanceled ? 'Canceled' : isActive ? 'Uploading' : 'Queued'}
                       </span>
                       {(isActive || item.status === 'queued') ? (
                         <Button
                           type='button'
                           variant='outline'
                           size='sm'
                           className='h-8 rounded-full border-border/70 bg-background/80 px-3'
                           onClick={() => handleCancelFile(item.id)}
                         >
                           <X className='h-3.5 w-3.5' />
                           {isActive ? 'Cancel' : 'Remove'}
                         </Button>
                       ) : null}
                     </div>
                   </div>
                   <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'>
                     <div
                       className={`h-full rounded-full transition-all duration-300 ease-out ${isDone ? 'bg-emerald-500' : isCanceled ? 'bg-muted-foreground/50' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                       style={{ width: `${isDone ? 100 : item.progress}%` }}
                     />
                   </div>
                 </div>
               );
             })}
           </div>
           <div className='flex items-center justify-between text-xs text-muted-foreground'>
             <p>{activeFileName ? `Working on ${activeFileName}` : 'Preparing your files for upload'}</p>
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
             Use the cancel button on each file row to stop or remove that file.
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
