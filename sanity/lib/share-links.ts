import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { client } from './client';

export const SHARE_DURATION_OPTIONS = [1, 24, 72, 168] as const;

const toHexHash = (value: string) => createHash('sha256').update(value).digest('hex');

const derivePasscodeHash = (passcode: string, salt: string) =>
  scryptSync(passcode, salt, 32).toString('hex');

export const createSecureShareLink = async ({
  fileId,
  durationHours,
  passcode,
}: {
  fileId: string;
  durationHours: number;
  passcode?: string;
}) => {
  const token = randomBytes(24).toString('base64url');
  const tokenHash = toHexHash(token);
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

  const hasPasscode = Boolean(passcode?.trim());
  const passcodeSalt = hasPasscode ? randomBytes(16).toString('hex') : '';
  const passcodeHash = hasPasscode ? derivePasscodeHash(passcode!.trim(), passcodeSalt) : '';

  await client.create({
    _type: 'shareLink',
    file: {
      _type: 'reference',
      _ref: fileId,
    },
    tokenHash,
    expiresAt,
    passcodeHash,
    passcodeSalt,
    revoked: false,
    accessCount: 0,
  });

  return {
    token,
    expiresAt,
  };
};

export const getShareLinkByToken = async (token: string) => {
  const tokenHash = toHexHash(token);

  const shareDoc = await client.fetch<{
    _id: string;
    expiresAt: string;
    revoked?: boolean;
    passcodeHash?: string;
    passcodeSalt?: string;
    filename?: string;
    fileUrl?: string;
    fileId?: string;
  } | null>(
    `*[_type == "shareLink" && tokenHash == $tokenHash][0]{
      _id,
      expiresAt,
      revoked,
      passcodeHash,
      passcodeSalt,
      "filename": file->filename,
      "fileUrl": file->file.asset->url,
      "fileId": file->_id
    }`,
    { tokenHash },
  );

  return shareDoc;
};

export const isShareExpired = (expiresAt: string) => new Date(expiresAt).getTime() <= Date.now();

export const verifySharePasscode = ({
  passcode,
  passcodeHash,
  passcodeSalt,
}: {
  passcode: string;
  passcodeHash: string;
  passcodeSalt: string;
}) => {
  const providedHash = derivePasscodeHash(passcode, passcodeSalt);

  const left = Buffer.from(providedHash, 'hex');
  const right = Buffer.from(passcodeHash, 'hex');

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
};

export const markShareAccessed = async (shareId: string) => {
  await client
    .patch(shareId)
    .inc({ accessCount: 1 })
    .set({ lastAccessedAt: new Date().toISOString() })
    .commit();
};
