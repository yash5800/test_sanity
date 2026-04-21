// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity";
import { client } from './client'
import { apiVersion, hasSanityConfig, token } from '../env'

const browserToken: string | false = process.env.SANITY_BROWSER_TOKEN
  ? String(process.env.SANITY_BROWSER_TOKEN)
  : false;

const liveConfig = {
  client: client.withConfig({
    token,
    apiVersion,
  }),
  browserToken,
};

const liveExports = hasSanityConfig ? defineLive(liveConfig) : null;

export const sanityFetch = liveExports?.sanityFetch ?? (async () => ({ data: [] }));
export const SanityLive = liveExports?.SanityLive ?? (() => null);
