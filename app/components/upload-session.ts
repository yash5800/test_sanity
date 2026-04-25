export type UploadSessionState = {
  uploadKey: string;
  phase: 'uploading' | 'completed';
  isUploading: boolean;
  selectedCount: number;
  uploadProgress: number;
  activeFileName: string | null;
  activeFileSize: number;
  loadedBytes: number;
  totalBytes: number;
  updatedAt: number;
};

export type UploadQueueItem = {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'uploaded' | 'canceled' | 'failed';
  progress: number;
  loadedBytes: number;
  totalBytes: number;
};

const EMPTY_UPLOAD_QUEUE: UploadQueueItem[] = [];

let currentUploadSession: UploadSessionState | null = null;
let currentUploadQueueKey: string | null = null;
let currentUploadQueue: UploadQueueItem[] = [];
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const getUploadSessionState = (uploadKey: string) => {
  if (!currentUploadSession || currentUploadSession.uploadKey !== uploadKey) {
    return null;
  }

  return currentUploadSession;
};

export const setUploadSessionState = (state: UploadSessionState) => {
  currentUploadSession = state;
  notifyListeners();
};

export const clearUploadSessionState = (uploadKey?: string) => {
  if (uploadKey && currentUploadSession?.uploadKey !== uploadKey) {
    return;
  }

  currentUploadSession = null;
  notifyListeners();
};

export const subscribeUploadSession = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const getUploadQueueState = (uploadKey: string) => {
  if (currentUploadQueueKey !== uploadKey) {
    return EMPTY_UPLOAD_QUEUE;
  }

  return currentUploadQueue;
};

export const setUploadQueueState = (uploadKey: string, queue: UploadQueueItem[]) => {
  currentUploadQueueKey = uploadKey;
  currentUploadQueue = queue;
  notifyListeners();
};

export const updateUploadQueueItem = (
  uploadKey: string,
  itemId: string,
  updater: (item: UploadQueueItem) => UploadQueueItem,
) => {
  if (currentUploadQueueKey !== uploadKey) {
    return;
  }

  currentUploadQueue = currentUploadQueue.map((item) => (item.id === itemId ? updater(item) : item));
  notifyListeners();
};

export const clearUploadQueueState = (uploadKey?: string) => {
  if (uploadKey && currentUploadQueueKey !== uploadKey) {
    return;
  }

  currentUploadQueueKey = null;
  currentUploadQueue = [];
  notifyListeners();
};

export const subscribeUploadQueue = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};