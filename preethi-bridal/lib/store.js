import { list, put, del } from '@vercel/blob';
// Each record is a small JSON file in Vercel Blob. The ?v= stamp defeats CDN caching so edits show instantly.
const bust = b => `${b.url}?v=${new Date(b.uploadedAt).getTime()}`;
const opts = { access: 'public', addRandomSuffix: false };
const readJson = async b => (await fetch(bust(b), { cache: 'no-store' })).json();
async function find(path) { const { blobs } = await list({ prefix: path }); return blobs.find(b => b.pathname === path); }

export const saveJson = (path, data) =>
  put(path, JSON.stringify(data), { ...opts, contentType: 'application/json', allowOverwrite: true, cacheControlMaxAge: 60 });
export async function getJson(path) { const b = await find(path); return b ? readJson(b) : null; }
export async function removeJson(path) { const b = await find(path); if (b) await del(b.url); }

async function readAll(prefix) {
  const { blobs } = await list({ prefix, limit: 1000 });
  const items = await Promise.all(blobs.filter(b => b.pathname.endsWith('.json')).map(readJson));
  return items.sort((a, b) => b.created - a.created);
}
export const getWorks = () => readAll('works/');
export const getTestimonials = () => readAll('testimonials/');

export async function getSite() {
  const out = { hero: null, about: null };
  const { blobs } = await list({ prefix: 'site/' });
  for (const k of Object.keys(out)) {
    const m = blobs.filter(b => b.pathname.startsWith(`site/${k}-`)).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    out[k] = m ? m.url : null;
  }
  return out;
}
export async function removeSite(kind) {
  const { blobs } = await list({ prefix: `site/${kind}-` });
  if (blobs.length) await del(blobs.map(b => b.url));
}
export async function setSite(kind, file) {
  const { blobs } = await list({ prefix: `site/${kind}-` });
  await put(`site/${kind}-${Date.now()}.jpg`, file, { ...opts, contentType: 'image/jpeg' });
  if (blobs.length) await del(blobs.map(b => b.url));
}
