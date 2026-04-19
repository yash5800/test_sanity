import { client } from './client';

type FileDocument = {
  _id: string;
  key?: string;
  filename?: string;
  file?: {
    asset?: {
      _ref?: string;
    };
  };
};

export const renameSanityFile = async (fileId: string, filename: string) => {
  const trimmedName = filename.trim();

  if (!trimmedName) {
    throw new Error('File name cannot be empty');
  }

  return client.patch(fileId).set({ filename: trimmedName }).commit();
};

export const copySanityFileToKey = async (fileId: string, key: string, filename?: string) => {
  const trimmedKey = key.trim();

  if (!trimmedKey) {
    throw new Error('Target key cannot be empty');
  }

  const file = await client.getDocument(fileId) as FileDocument | null;

  if (!file) {
    throw new Error('File could not be found');
  }

  const currentKey = file.key?.trim();

  if (currentKey && currentKey === trimmedKey) {
    throw new Error('Target key must be different from the current key');
  }

  const assetRef = file?.file?.asset?._ref;

  if (!assetRef) {
    throw new Error('File asset could not be found');
  }

  return client.create({
    _type: 'post',
    key: trimmedKey,
    filename: filename?.trim() || file.filename || 'Copied file',
    copiedFromId: fileId,
    file: {
      _type: 'file',
      asset: {
        _ref: assetRef,
      },
    },
  });
};

export const updateSanityFileMetadata = async (fileId: string, tags: string[], note: string) => {
  const cleanedTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
  const trimmedNote = note.trim();

  return client
    .patch(fileId)
    .set({
      tags: cleanedTags,
      note: trimmedNote,
    })
    .commit();
};

const deleteShareLinksForFiles = async (fileIds: string[]): Promise<number> => {
  if (!fileIds.length) {
    return 0;
  }

  const shareLinkIds = await client.fetch<string[]>(
    `*[_type == "shareLink" && file._ref in $fileIds]._id`,
    { fileIds },
  );

  if (!shareLinkIds.length) {
    return 0;
  }

  const tx = shareLinkIds.reduce((transaction, id) => transaction.delete(id), client.transaction());
  await tx.commit();
  return shareLinkIds.length;
};

const deleteAssetIfUnreferenced = async (assetId: string): Promise<boolean> => {
  const refs = await client.fetch<number>(
    `count(*[_type != "sanity.fileAsset" && _type != "sanity.imageAsset" && references($assetId)])`,
    { assetId },
  );

  if (refs > 0) {
    return false;
  }

  await client.delete(assetId);
  return true;
};

export const deleteSanityFileWithCleanup = async (fileId: string) => {
  const doc = await client.getDocument(fileId) as FileDocument | null;

  if (!doc) {
    throw new Error('File could not be found');
  }

  const assetId = doc.file?.asset?._ref;

  await deleteShareLinksForFiles([fileId]);
  await client.delete(fileId);

  let assetDeleted = false;

  if (assetId) {
    assetDeleted = await deleteAssetIfUnreferenced(assetId);
  }

  return {
    deletedFileId: fileId,
    deletedAssetId: assetDeleted ? assetId : null,
  };
};

export const wipeSanityFilesByKeyWithCleanup = async (key: string) => {
  const files = await client.fetch<FileDocument[]>(
    `*[_type == "post" && key == $key]{_id, file{asset{_ref}}}`,
    { key },
  );

  if (!files.length) {
    return {
      deletedFiles: 0,
      deletedAssets: 0,
    };
  }

  const fileIds = files.map((file) => file._id);
  const assetIds = Array.from(
    new Set(files.map((file) => file.file?.asset?._ref).filter(Boolean)),
  ) as string[];

  await deleteShareLinksForFiles(fileIds);

  const deleteDocsTransaction = fileIds.reduce((tx, id) => tx.delete(id), client.transaction());
  await deleteDocsTransaction.commit();

  const assetResults = await Promise.all(assetIds.map((assetId) => deleteAssetIfUnreferenced(assetId)));

  return {
    deletedFiles: fileIds.length,
    deletedAssets: assetResults.filter(Boolean).length,
  };
};