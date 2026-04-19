"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { FileArchive, FileText, Presentation, Search, SlidersHorizontal } from 'lucide-react';

import DeleteBut from './DeleteBut';
import DownloadBut from './DownloadBut';
import ShareBut from './ShareBut';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { formatBytes } from '@/lib/format-storage';

export interface UserFileItem {
  key: string;
  filename: string;
  fileUrl: string;
  size?: number;
  _createdAt: string;
  _id: string;
}

const fileTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'DOCX', value: 'docx' },
  { label: 'PDF', value: 'pdf' },
  { label: 'PPT', value: 'ppt' },
] as const;

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
] as const;

type FileTypeFilter = (typeof fileTypeOptions)[number]['value'];
type SortOrder = (typeof sortOptions)[number]['value'];

const getFileType = (file: UserFileItem) => {
  const source = `${file.filename} ${file.fileUrl}`.toLowerCase();

  if (source.includes('.docx')) return 'docx';
  if (source.includes('.pdf')) return 'pdf';
  if (source.includes('.pptx') || source.includes('.ppt')) return 'ppt';

  return 'all';
};

const getFileIcon = (file: UserFileItem) => {
  switch (getFileType(file)) {
    case 'docx':
      return <FileText className='h-4 w-4' />;
    case 'pdf':
      return <FileArchive className='h-4 w-4' />;
    case 'ppt':
      return <Presentation className='h-4 w-4' />;
    default:
      return <FileText className='h-4 w-4' />;
  }
};

const UserFilesList = ({ files }: { files: UserFileItem[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState<FileTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const filteredFiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const nextFiles = files.filter((file) => {
      const matchesSearch = !query || file.filename.toLowerCase().includes(query);
      const matchesType = fileType === 'all' || getFileType(file) === fileType;

      return matchesSearch && matchesType;
    });

    return nextFiles.sort((left, right) => {
      const leftTime = new Date(left._createdAt).getTime();
      const rightTime = new Date(right._createdAt).getTime();

      return sortOrder === 'newest' ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [files, fileType, searchTerm, sortOrder]);

  const hasActiveFilters = fileType !== 'all' || sortOrder !== 'newest' || searchTerm.length > 0;

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='relative w-full sm:max-w-md'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder='Search by filename'
            className='h-11 w-full rounded-2xl pl-9'
          />
        </div>

        <div className='flex flex-col gap-3 rounded-[1.4rem] border border-border/70 bg-background/70 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-secondary/90 px-3 py-1 text-xs font-medium text-secondary-foreground'>
              <SlidersHorizontal className='h-3.5 w-3.5' />
              Type
            </span>
            {fileTypeOptions.map((option) => (
              <Button
                key={option.value}
                type='button'
                size='sm'
                variant={fileType === option.value ? 'default' : 'outline'}
                className='rounded-full'
                onClick={() => setFileType(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-secondary/90 px-3 py-1 text-xs font-medium text-secondary-foreground'>
              <SlidersHorizontal className='h-3.5 w-3.5' />
              Sort
            </span>
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                type='button'
                size='sm'
                variant={sortOrder === option.value ? 'default' : 'outline'}
                className='rounded-full'
                onClick={() => setSortOrder(option.value)}
              >
                {option.label}
              </Button>
            ))}
            {hasActiveFilters ? (
              <Button
                type='button'
                size='sm'
                variant='ghost'
                className='rounded-full'
                onClick={() => {
                  setSearchTerm('');
                  setFileType('all');
                  setSortOrder('newest');
                }}
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`${filteredFiles.length > 0 ? 'card_grid' : ''} mt-2`}>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((item) => (
            <Card key={item._id} className='overflow-hidden border-border/70 bg-card/90 shadow-sm shadow-black/10'>
              <div className='h-1.5 bg-gradient-to-r from-primary via-chart-2 to-chart-4' />
              <CardHeader className='space-y-3 p-5 pb-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 flex-1 items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                      {getFileIcon(item)}
                    </div>
                    <h1 className='min-w-0 flex-1 truncate text-lg font-semibold'>{item.filename}</h1>
                  </div>
                  <Badge className='rounded-full bg-secondary text-secondary-foreground'>Stored</Badge>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Image src='/timer.png' alt='timerlogo' width={18} height={18} />
                  <p>
                    {new Date(item._createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span className='inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground'>
                    {typeof item.size === 'number' ? formatBytes(item.size) : 'Size unknown'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className='px-5 pb-4'>
                <div className='flex flex-wrap gap-2'>
                  <DownloadBut file={{ filename: item.filename, fileUrl: item.fileUrl }} />
                  <ShareBut file={{ filename: item.filename, fileUrl: item.fileUrl }} />
                  <DeleteBut fileId={item._id} fileName={item.filename} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className='rounded-[1.4rem] border border-dashed border-border/80 bg-card/70 px-6 py-10 text-center text-muted-foreground'>
            {files.length === 0 ? 'Looks like this folder is empty.' : 'No files found for your search.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFilesList;