/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "./client";
import { hasSanityConfig } from "../env";
import { formatBytes } from "../../lib/format-storage";

export const fetchTotalStorageBytes = async () => {
  if (!hasSanityConfig) {
    return 0;
  }

  const assets = await client.fetch(`
    *[_type in ["sanity.fileAsset", "sanity.imageAsset"]] {
      "size": size
    }
  `, {}, { cache: 'no-store' });

  return assets.reduce((sum: number, asset: any) => sum + (asset.size || 0), 0);
};

export const fetchTotalStorageUsed = async () => {
  try {
    const totalSize = await fetchTotalStorageBytes();
    return formatBytes(totalSize);
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

