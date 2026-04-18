import { client } from "./client"

export const uploadToSanity = async (uploadKey:string,file:File) => {
  try{
    if(!uploadKey||!file) return null;
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

  const uploadedFiles = [];

  for (const [index, file] of files.entries()) {
    const uploadedFile = await uploadToSanity(uploadKey, file);
    uploadedFiles.push(uploadedFile);
    onProgress?.({ completed: index + 1, total: files.length, file });
  }

  return uploadedFiles;
};

