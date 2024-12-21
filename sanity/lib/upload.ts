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

    console.log("Document created successfully",document);

    return document;
  }
  catch (error){
     console.log("Error uploading",error);
     throw error;
  }
};

