import { list } from '@vercel/blob';
const byNew = (a, b) => new Date(b.uploadedAt || b.at) - new Date(a.uploadedAt || a.at);
export async function getWorks() {
  try { const { blobs } = await list({ prefix: 'works/' }); return blobs.sort(byNew).map(b => ({ url: b.url })); } catch { return []; }
}
export async function getTestimonials() {
  try {
    const { blobs } = await list({ prefix: 'testimonials/' });
    const items = await Promise.all(blobs.map(async b => {
      try { const d = await (await fetch(b.url, { cache: 'no-store' })).json(); return { ...d, url: b.url, at: b.uploadedAt }; } catch { return null; }
    }));
    return items.filter(Boolean).sort(byNew);
  } catch { return []; }
}

export async function getSite() {
  const out = { hero: null, about: null };
  try {
    const { blobs } = await list({ prefix: 'site/' });
    for (const k of Object.keys(out)) {
      const m = blobs.filter(b => b.pathname.startsWith(`site/${k}-`)).sort(byNew)[0];
      out[k] = m ? m.url : null;
    }
  } catch {}
  return out;
}
