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

export const verifyFileOwnership = async (fileId: string, key: string): Promise<boolean> => {
  const trimmedKey = key.trim();
  
  if (!fileId || !trimmedKey) {
    return false;
  }

  const doc = await client.fetch<{ _id: string } | null>(
    `*[_type == "post" && _id == $fileId && key == $key][0]._id`,
    { fileId, key: trimmedKey },
  );

  return doc !== null;
};

export const verifyKeyOwnership = async (key: string): Promise<boolean> => {
  const trimmedKey = key.trim();
  
  if (!trimmedKey) {
    return false;
  }

  if (trimmedKey.length < 4) {
    return false;
  }

  const exists = await client.fetch<boolean>(
    `count(*[_type == "post" && key == $key]) > 0`,
    { key: trimmedKey },
  );

  return exists;
};

const MAX_FILENAME_LENGTH = 255;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS_COUNT = 10;
const MAX_NOTE_LENGTH = 1000;

const sanitizeString = (input: string, maxLength: number): string => {
  return input.slice(0, maxLength).replace(/[<>]/g, '');
};

export const renameSanityFile = async (fileId: string, filename: string) => {
  const trimmedName = filename.trim();

  if (!trimmedName) {
    throw new Error('File name cannot be empty');
  }

  if (trimmedName.length > MAX_FILENAME_LENGTH) {
    throw new Error(`File name too long (max ${MAX_FILENAME_LENGTH} characters)`);
  }

  const sanitized = sanitizeString(trimmedName, MAX_FILENAME_LENGTH);

  return client.patch(fileId).set({ filename: sanitized }).commit();
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
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    file: {
      _type: 'file',
      asset: {
        _ref: assetRef,
      },
    },
  });
};

export const updateSanityFileMetadata = async (fileId: string, tags: string[], note: string) => {
  const uniqueTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
  const sanitizedTags = uniqueTags.slice(0, MAX_TAGS_COUNT).map((tag) => sanitizeString(tag, MAX_TAG_LENGTH));
  const trimmedNote = note.trim();
  const sanitizedNote = sanitizeString(trimmedNote, MAX_NOTE_LENGTH);

  if (sanitizedNote.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note too long (max ${MAX_NOTE_LENGTH} characters)`);
  }

  return client
    .patch(fileId)
    .set({
      tags: sanitizedTags,
      note: sanitizedNote,
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

export const deleteExpiredFilesByAge = async (olderThanIso: string) => {
  const files = await client.fetch<FileDocument[]>(
    `*[_type == "post" && _createdAt <= $olderThanIso]{_id, file{asset{_ref}}}`,
    { olderThanIso },
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