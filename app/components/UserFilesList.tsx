"use client";

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { CalendarClock, Info, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { formatBytes } from '@/lib/format-storage';
import { FILE_ICON_FALLBACK_ICON, getFileExtension, getFileIconCategory, getFileIconSrc } from './file-icon-map';
import FileActions from './FileActions';

export interface UserFileItem {
  key: string;
  filename: string;
  copiedFromId?: string;
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

const UserFilesList = ({ files, currentKey }: { files: UserFileItem[]; currentKey: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState<FileTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [expandedMobileDetailsId, setExpandedMobileDetailsId] = useState<string | null>(null);

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

      <div className={`${filteredFiles.length > 0 ? 'card_grid' : ''} mt-2 animate-enter`}>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((item, index) => (
            <Card
              key={item._id}
              className='hover-lift animate-enter overflow-hidden border-border/70 bg-card/90 shadow-sm shadow-black/10'
              style={{ animationDelay: `${index * 65}ms` }}
            >
              <div className='h-1.5 bg-gradient-to-r from-primary via-chart-2 to-chart-4' />
              <CardHeader className='space-y-3 p-5 pb-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 flex-1 items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 p-2'>
                      {getFileIconCategory(item.filename, item.fileUrl) === 'generic' ? (
                        <FILE_ICON_FALLBACK_ICON className='h-7 w-7 text-muted-foreground' aria-hidden='true' />
                      ) : (
                        <Image
                          src={getFileIconSrc(item.filename, item.fileUrl)}
                          alt={`${getFileExtension(item.filename, item.fileUrl) || 'file'} icon`}
                          width={28}
                          height={28}
                          className='h-7 w-7 object-contain'
                        />
                      )}
                    </div>
                    <div className='min-w-0 flex-1 space-y-2'>
                      <h1 className='min-w-0 text-base font-semibold leading-snug sm:text-lg'>
                        <span className={`block sm:hidden ${expandedMobileDetailsId === item._id ? 'break-all' : 'truncate'}`}>
                          {item.filename.split('.').slice(0, -1).join('.') || item.filename}
                        </span>
                        <span className='hidden truncate sm:block'>{item.filename.split('.').slice(0, -1).join('.') || item.filename}</span>
                      </h1>
                      <Badge className='w-fit rounded-full border border-border/70 bg-secondary/70 text-secondary-foreground'>
                        {getFileExtension(item.filename, item.fileUrl).toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 rounded-full sm:hidden'
                      aria-label={`${expandedMobileDetailsId === item._id ? 'Hide details for' : 'Show details for'} ${item.filename}`}
                      onClick={() =>
                        setExpandedMobileDetailsId((current) =>
                          current === item._id ? null : item._id,
                        )
                      }
                    >
                      <Info className={`h-4 w-4 ${expandedMobileDetailsId === item._id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <Badge
                      className={`rounded-full ${item.copiedFromId ? 'bg-chart-2/20 text-chart-2' : 'bg-secondary text-secondary-foreground'}`}
                    >
                      {item.copiedFromId ? 'Clone' : 'Stored'}
                    </Badge>
                  </div>
                </div>
                <div
                  className={`items-center gap-2 text-sm text-muted-foreground sm:flex ${
                    expandedMobileDetailsId === item._id ? 'flex animate-enter' : 'hidden'
                  }`}
                >
                  <CalendarClock className='h-4 w-4 text-chart-2' aria-hidden='true' />
                  <p>
                    {new Date(item._createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div
                  className={`items-center gap-2 text-sm text-muted-foreground sm:flex ${
                    expandedMobileDetailsId === item._id ? 'flex animate-enter' : 'hidden'
                  }`}
                >
                  <span className='inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground'>
                    {typeof item.size === 'number' ? formatBytes(item.size) : 'Size unknown'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className='px-5 pb-4'>
                  <FileActions
                    file={{ _id: item._id, filename: item.filename, fileUrl: item.fileUrl }}
                    currentKey={currentKey}
                  />
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