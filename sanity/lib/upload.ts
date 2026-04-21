import { client } from "./client"

export const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024 * 1024;

type UploadDocument = {
  _id: string;
  originalFilename?: string;
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

export const uploadToSanity = async (
  uploadKey: string,
  file: File,
  onProgress?: (progress: FileUploadProgress) => void,
) => {
  try {
    if (!uploadKey || !file) {
      return null;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error('File must be 1 GB or smaller');
    }

    const uploadFile = await new Promise<UploadDocument>((resolve, reject) => {
      const request = new XMLHttpRequest();
      const { token, withCredentials } = client.config();
      const uploadUrl = buildUploadUrl('file', file);

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
        reject(new Error('File upload failed'));
      };

      request.send(file);
    });

    const document = await client.create({
      _type: 'post',
      key: uploadKey,
      filename: uploadFile.originalFilename || file.name,
      size: file.size,
      file: {
        _type: 'file',
        asset: {
          _ref: uploadFile._id,
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
) => {
  if (!uploadKey || files.length === 0) {
    return [];
  }

  const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_SIZE_BYTES);

  if (oversizedFile) {
    throw new Error(`${oversizedFile.name} is larger than 1 GB`);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0) || files.length;
  const uploadedFiles = [];
  let completedBytes = 0;

  for (const [index, file] of files.entries()) {
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
    });

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

