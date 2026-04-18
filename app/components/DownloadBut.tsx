'use client'
import { Download } from 'lucide-react';

import { buttonVariants } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';

const DownloadBut = ({file}:{file:{filename:string,fileUrl:string}}) => {
  return (
         <a
         href={file.fileUrl}
         download={file.filename}
         target='_blank'
         rel='noreferrer'
         className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full')}
         >
            <Download className="h-4 w-4" />
            Download
        </a>
  )
}

export default DownloadBut
