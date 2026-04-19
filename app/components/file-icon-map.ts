import { FiFile } from 'react-icons/fi';

export type FileIconCategory =
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'archive'
  | 'audio'
  | 'code'
  | 'generic'
  | 'compressed';

const FILE_ICON_SRC_BY_CATEGORY: Record<FileIconCategory, string> = {
  document: '/icons/google-docs.png',
  spreadsheet: '/icons/sheets.png',
  presentation: '/icons/ppt.png',
  pdf: '/icons/pdf.png',
  image: '/icons/photo.png',
  video: '/icons/youtube.png',
  archive: '/icons/zip_6354365.png',
  audio: '/icons/audio_5799124.png',
  code: '/icons/code_4997543.png',
  generic: '/icons/file.png',
  compressed: '/icons/zip_6354365.png',
};

export const FILE_ICON_CATEGORY_BY_EXTENSION: Record<string, FileIconCategory> = {
  doc: 'document',
  docx: 'document',
  odt: 'document',
  rtf: 'document',
  txt: 'document',
  md: 'document',
  pdf: 'pdf',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  ods: 'spreadsheet',
  csv: 'spreadsheet',
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',
  tif: 'image',
  tiff: 'image',
  mp4: 'video',
  mov: 'video',
  mkv: 'video',
  avi: 'video',
  webm: 'video',
  m4v: 'video',
  '3gp': 'video',
  ytb: 'video',
  youtube: 'video',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  tgz: 'archive',
  bz2: 'archive',
  xz: 'archive',
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  oga: 'audio',
  flac: 'audio',
  m4a: 'audio',
  aac: 'audio',
  wma: 'audio',
  mid: 'audio',
  midi: 'audio',
  js: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  mjs: 'code',
  cjs: 'code',
  json: 'code',
  jsonc: 'code',
  html: 'code',
  htm: 'code',
  css: 'code',
  scss: 'code',
  sass: 'code',
  less: 'code',
  xml: 'code',
  yaml: 'code',
  yml: 'code',
  markdown: 'code',
  py: 'code',
  java: 'code',
  c: 'code',
  cpp: 'code',
  cc: 'code',
  cxx: 'code',
  h: 'code',
  hh: 'code',
  hpp: 'code',
  go: 'code',
  rs: 'code',
  php: 'code',
  rb: 'code',
  sh: 'code',
  bash: 'code',
  zsh: 'code',
  sql: 'code',
  swift: 'code',
  kt: 'code',
  kts: 'code',
  dart: 'code',
  vue: 'code',
  svelte: 'code',
  ipynb: 'code',
};

export const FILE_ICON_FALLBACK_ICON = FiFile;

const stripQueryAndHash = (value: string) => value.split('?')[0].split('#')[0];

export const getFileExtension = (filename: string, fileUrl?: string) => {
  const normalizedName = stripQueryAndHash(filename);
  const fileNameParts = normalizedName.split('.');

  if (fileNameParts.length > 1) {
    return fileNameParts[fileNameParts.length - 1].toLowerCase();
  }

  if (!fileUrl) {
    return '';
  }

  const normalizedUrl = stripQueryAndHash(fileUrl);
  const urlName = normalizedUrl.split('/').pop() ?? '';
  const urlNameParts = urlName.split('.');

  return urlNameParts.length > 1 ? urlNameParts[urlNameParts.length - 1].toLowerCase() : '';
};

export const getFileIconSrc = (filename: string, fileUrl?: string) => {
  const extension = getFileExtension(filename, fileUrl);
  const category = FILE_ICON_CATEGORY_BY_EXTENSION[extension] ?? 'generic';

  return FILE_ICON_SRC_BY_CATEGORY[category];
};

export const getFileIconCategory = (filename: string, fileUrl?: string) => {
  const extension = getFileExtension(filename, fileUrl);

  return FILE_ICON_CATEGORY_BY_EXTENSION[extension] ?? 'generic';
};
