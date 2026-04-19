export type DownloadProgressState = {
  loaded: number;
  total: number;
  percent: number;
};

type DownloadOptions = {
  url: string;
  method?: 'GET' | 'POST';
  body?: FormData | URLSearchParams | string | null;
  filename?: string;
  onProgress?: (progress: DownloadProgressState) => void;
};

const createObjectUrlDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noreferrer';
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
};

export const downloadFileWithProgress = ({
  url,
  method = 'GET',
  body,
  filename = 'download',
  onProgress,
}: DownloadOptions) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(method, url, true);
    request.responseType = 'blob';

    request.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent,
      });
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error('Unable to download file'));
        return;
      }

      onProgress?.({
        loaded: request.response?.size ?? 1,
        total: request.response?.size ?? 1,
        percent: 100,
      });

      const contentDisposition = request.getResponseHeader('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const resolvedFilename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || filename);

      createObjectUrlDownload(request.response, resolvedFilename);
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Unable to download file'));
    };

    if (body instanceof FormData) {
      request.send(body);
      return;
    }

    if (body instanceof URLSearchParams || typeof body === 'string') {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      request.send(body);
      return;
    }

    request.send();
  });
