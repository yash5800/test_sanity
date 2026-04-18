// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity";
import { client } from './client'
import { hasSanityConfig, token } from '../env'

const liveConfig = {
  client: client.withConfig({
    // Live content is currently only available on the experimental API
    // https://www.sanity.io/docs/api-versioning
    token,
    apiVersion: 'vX',
  }),
  browserToken: process.env.SANITY_BROWSER_TOKEN,
};

const liveExports = hasSanityConfig ? defineLive(liveConfig) : null;

export const sanityFetch = liveExports?.sanityFetch ?? (async () => ({ data: [] }));
export const SanityLive = liveExports?.SanityLive ?? (() => null);
