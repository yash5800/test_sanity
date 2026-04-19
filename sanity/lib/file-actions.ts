import { client } from './client';

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

  const file = await client.getDocument(fileId);
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