import { client } from './client';

type CodeNoteDocument = {
  _id: string;
  key: string;
  title: string;
  content: string;
  expiresAt?: string;
  _createdAt: string;
  _updatedAt: string;
};

const NOTE_RETENTION_DAYS = 10;

const getNoteExpiry = () => new Date(Date.now() + NOTE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

export const listCodeNotes = async (key: string) => {
  return client.fetch<CodeNoteDocument[]>(
    `*[_type == "codeNote" && key == $key]|order(_updatedAt desc){
      _id,
      key,
      title,
      content,
      expiresAt,
      _createdAt,
      _updatedAt
    }`,
    { key: key.trim() },
  );
};

export const createCodeNote = async (key: string, title = '', content = '') => {
  const trimmedKey = key.trim();
  if (!trimmedKey) {
    throw new Error('Workspace key is required');
  }

  return client.create({
    _type: 'codeNote',
    key: trimmedKey,
    title: title.trim(),
    content: content.trim(),
    expiresAt: getNoteExpiry(),
  });
};

export const updateCodeNote = async (noteId: string, patch: { title?: string; content?: string }) => {
  return client.patch(noteId).set(patch).commit();
};

export const deleteCodeNote = async (noteId: string) => {
  return client.delete(noteId);
};

export const wipeCodeNotesByKey = async (key: string) => {
  const noteIds = await client.fetch<string[]>(
    `*[_type == "codeNote" && key == $key]._id`,
    { key: key.trim() },
  );

  if (!noteIds.length) {
    return 0;
  }

  const tx = noteIds.reduce((transaction, id) => transaction.delete(id), client.transaction());
  await tx.commit();

  return noteIds.length;
};

export const deleteExpiredCodeNotes = async () => {
  const cutoff = new Date(Date.now() - NOTE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const noteIds = await client.fetch<string[]>(
    `*[_type == "codeNote" && _createdAt <= $cutoff]._id`,
    { cutoff },
  );

  if (!noteIds.length) {
    return 0;
  }

  const tx = noteIds.reduce((transaction, id) => transaction.delete(id), client.transaction());
  await tx.commit();

  return noteIds.length;
};
