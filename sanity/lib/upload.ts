import { client } from "./client"

export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024;
export const MAX_UPLOAD_SIZE_LABEL = '200 MB';

type UploadDocument = {
  _id?: string;
  id?: string;
  originalFilename?: string;
  document?: {
    _id?: string;
    originalFilename?: string;
  };
};

type ResolvedUploadDocument = {
  assetId: string;
  originalFilename: string;
};

type FileUploadProgress = {
  loadedBytes: number;
  totalBytes: number;
  percent: number;
};

type UploadProgress = FileUploadProgress & {
  completed: number;
  total: number;
  file: File;
};

const buildUploadUrl = (assetType: 'file' | 'image', file: File) => {
  const config = client.config();
  const assetEndpoint = assetType === 'image' ? 'images' : 'files';
  const uploadUrl = new URL(client.getUrl(`/assets/${assetEndpoint}/${config.dataset}`, false));

  uploadUrl.searchParams.set('filename', file.name);

  return uploadUrl.toString();
};

const resolveUploadDocument = (uploadDocument: UploadDocument, fallbackFilename: string): ResolvedUploadDocument => {
  const assetId = uploadDocument._id || uploadDocument.id || uploadDocument.document?._id;

  if (!assetId) {
    throw new Error('Upload completed but no asset id was returned by Sanity');
  }

  const originalFilename = uploadDocument.originalFilename || uploadDocument.document?.originalFilename || fallbackFilename;

  return {
    assetId,
    originalFilename,
  };
};

export const uploadToSanity = async (
  uploadKey: string,
  file: File,
  onProgress?: (progress: FileUploadProgress) => void,
  signal?: AbortSignal,
) => {
  try {
    if (!uploadKey || !file) {
      return null;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`File must be ${MAX_UPLOAD_SIZE_LABEL} or smaller`);
    }

    if (signal?.aborted) {
      throw new DOMException('Upload canceled', 'AbortError');
    }

    const uploadFile = await new Promise<UploadDocument>((resolve, reject) => {
      const request = new XMLHttpRequest();
      const { token, withCredentials } = client.config();
      const uploadUrl = buildUploadUrl('file', file);

      const abortUpload = () => {
        request.abort();
        reject(new DOMException('Upload canceled', 'AbortError'));
      };

      if (signal) {
        signal.addEventListener('abort', abortUpload, { once: true });
      }

      const cleanup = () => {
        if (signal) {
          signal.removeEventListener('abort', abortUpload);
        }
      };

      request.open('POST', uploadUrl, true);
      request.responseType = 'text';

      if (token) {
        request.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (withCredentials) {
        request.withCredentials = true;
      }

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const loadedBytes = event.loaded;
        const totalBytes = event.total || file.size;
        const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));

        onProgress?.({
          loadedBytes,
          totalBytes,
          percent,
        });
      };

      request.onload = () => {
        cleanup();

        if (request.status < 200 || request.status >= 300) {
          const errorMessage = request.responseText || 'File upload failed';
          reject(new Error(errorMessage));
          return;
        }

        let response: UploadDocument;

        try {
          response = JSON.parse(request.responseText) as UploadDocument;
        } catch {
          reject(new Error('Unable to parse upload response'));
          return;
        }

        onProgress?.({
          loadedBytes: file.size,
          totalBytes: file.size,
          percent: 100,
        });

        resolve(response);
      };

      request.onerror = () => {
        cleanup();
        reject(new Error('File upload failed'));
      };

      request.onabort = () => {
        cleanup();
        reject(new DOMException('Upload canceled', 'AbortError'));
      };

      request.send(file);
    });

    const resolvedUpload = resolveUploadDocument(uploadFile, file.name);

    const document = await client.create({
      _type: 'post',
      key: uploadKey,
      filename: resolvedUpload.originalFilename,
      size: file.size,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      file: {
        _type: 'file',
        asset: {
          _ref: resolvedUpload.assetId,
        },
      },
    });

    return document;
  } catch (error) {
    throw error;
  }
};

export const uploadManyToSanity = async (
  uploadKey: string,
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
) => {
  if (!uploadKey || files.length === 0) {
    return [];
  }

  if (signal?.aborted) {
    throw new DOMException('Upload canceled', 'AbortError');
  }

  const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_SIZE_BYTES);

  if (oversizedFile) {
    throw new Error(`${oversizedFile.name} is larger than ${MAX_UPLOAD_SIZE_LABEL}`);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0) || files.length;
  const uploadedFiles = [];
  let completedBytes = 0;

  for (const [index, file] of files.entries()) {
    if (signal?.aborted) {
      throw new DOMException('Upload canceled', 'AbortError');
    }

    const uploadedFile = await uploadToSanity(uploadKey, file, (progress) => {
      const currentLoadedBytes = completedBytes + progress.loadedBytes;
      const percent = totalBytes > 0 ? Math.min(100, Math.round((currentLoadedBytes / totalBytes) * 100)) : 100;

      onProgress?.({
        completed: index,
        total: files.length,
        file,
        loadedBytes: currentLoadedBytes,
        totalBytes,
        percent,
      });
    }, signal);

    uploadedFiles.push(uploadedFile);
    completedBytes += file.size;

    onProgress?.({
      completed: index + 1,
      total: files.length,
      file,
      loadedBytes: completedBytes,
      totalBytes,
      percent: totalBytes > 0 ? Math.min(100, Math.round((completedBytes / totalBytes) * 100)) : 100,
    });
  }

  return uploadedFiles;
};

