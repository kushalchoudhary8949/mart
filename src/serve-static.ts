import { serveStatic } from 'hono/cloudflare-workers';

export function servePublicAssets() {
  return serveStatic({ root: './public' });
}
