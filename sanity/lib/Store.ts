/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "./client";

export const fetchTotalStorageUsed = async () => {
  try {
    const assets = await client.fetch(`
      *[_type == "sanity.fileAsset"] {
        "size": size
      }
    `);

    // Calculate the total size in bytes
    const totalSize = assets.reduce((sum: number, asset: any) => sum + (asset.size || 0), 0);

    // Convert size to MB
    const totalSizeInMB = totalSize / (1024 * 1024);
    console.log(`Total Storage Used: ${totalSizeInMB.toFixed(2)} MB`);
    return totalSizeInMB.toFixed(2);
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

