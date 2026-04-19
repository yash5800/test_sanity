import { client } from './client';
import { getShareLinkByToken, markShareAccessed } from './share-links';

const encodeAttachmentFilename = (filename: string) => {
  const safeFilename = filename.replace(/"/g, '\\"');
  return `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
};

const streamRemoteFile = async (fileUrl: string, filename: string) => {
  const upstreamResponse = await fetch(fileUrl, {
    cache: 'no-store',
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    throw new Error('Unable to fetch file from storage');
  }

  return new Response(upstreamResponse.body, {
    status: 200,
    headers: {
      'Content-Type': upstreamResponse.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': encodeAttachmentFilename(filename),
      'Cache-Control': 'no-store',
    },
  });
};

export const downloadFileById = async (fileId: string) => {
  const file = await client.fetch<{ filename?: string; fileUrl?: string } | null>(
    `*[_id == $fileId][0]{filename, "fileUrl": file.asset->url}`,
    { fileId },
  );

  if (!file?.fileUrl) {
    throw new Error('File not found');
  }

  return streamRemoteFile(file.fileUrl, file.filename || 'download');
};

export const downloadShareFileByToken = async ({
  token,
  passcode,
}: {
  token: string;
  passcode?: string;
}) => {
  const share = await getShareLinkByToken(token);

  if (!share || share.revoked) {
    throw new Error('Share link not found');
  }

  const isExpired = new Date(share.expiresAt).getTime() <= Date.now();

  if (isExpired) {
    throw new Error('Share link has expired');
  }

  if (!share.fileId) {
    throw new Error('Shared file is no longer available');
  }

  if (share.passcodeHash) {
    if (!passcode) {
      throw new Error('Passcode is required');
    }

    const { verifySharePasscode } = await import('./share-links');

    if (!share.passcodeSalt || !verifySharePasscode({ passcode, passcodeHash: share.passcodeHash, passcodeSalt: share.passcodeSalt })) {
      throw new Error('Invalid passcode');
    }
  }

  await markShareAccessed(share._id);
  return downloadFileById(share.fileId);
};
