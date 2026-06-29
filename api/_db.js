// Shared Neon client. DATABASE_URL is a Vercel environment variable (server-side only).
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

// Small helper to read a JSON body across runtimes.
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
  });
}
