import { client } from "./client"

export const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024 * 1024;

export const uploadToSanity = async (uploadKey:string,file:File) => {
  try{
    if(!uploadKey||!file) return null;

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error('File must be 1 GB or smaller');
    }

    const uploadFile = await client.assets.upload('file',file);

    const document = await client.create({
      _type:'post',
      key:uploadKey,
      filename:uploadFile.originalFilename,
      file:{
        _type:'file',
        asset:{
          _ref:uploadFile._id,
        }
      }
    });

    return document;
  }
  catch (error){
     throw error;
  }
};

type UploadProgress = {
  completed: number;
  total: number;
  file: File;
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

  const uploadedFiles = [];

  for (const [index, file] of files.entries()) {
    const uploadedFile = await uploadToSanity(uploadKey, file);
    uploadedFiles.push(uploadedFile);
    onProgress?.({ completed: index + 1, total: files.length, file });
  }

  return uploadedFiles;
};

