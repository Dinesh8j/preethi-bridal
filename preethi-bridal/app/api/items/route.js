import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getWorks, getTestimonials, getSite, saveJson, getJson, removeJson, setSite, removeSite } from '../../../lib/store';
export const dynamic = 'force-dynamic';

const authed = r => !!process.env.ADMIN_PASSWORD && r.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
const send = (d, s = 200) => NextResponse.json(d, { status: s });
const clip = (v, n) => String(v ?? '').slice(0, n);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const upImage = file => put(`images/${uid()}.jpg`, file, { access: 'public', addRandomSuffix: false, contentType: 'image/jpeg' });
const bad = () => send({ error: 'Wrong password' }, 401);
const pathOf = (type, id) => `${type === 'works' ? 'works' : 'testimonials'}/${String(id).replace(/[^a-z0-9]/gi, '')}.json`;

export async function GET(req) {
  const t = new URL(req.url).searchParams.get('type');
  try {
    if (t === 'auth') return authed(req) ? send({ ok: true }) : bad();
    if (t === 'testimonials') return send(await getTestimonials());
    if (t === 'site') return send(await getSite());
    return send(await getWorks());
  } catch (e) { return send({ error: e.message }, 500); }
}

export async function POST(req) {
  if (!authed(req)) return bad();
  try {
    const f = await req.formData(); const type = f.get('type');
    if (type === 'hero' || type === 'about') await setSite(type, f.get('file'));
    else if (type === 'works') {
      const file = f.get('file'); if (!file) return send({ error: 'Photo required' }, 400);
      const id = uid(); const b = await upImage(file);
      await saveJson(`works/${id}.json`, { id, title: clip(f.get('title'), 100), description: clip(f.get('description'), 500), image: b.url, created: Date.now() });
    } else {
      const id = uid();
      await saveJson(`testimonials/${id}.json`, { id, name: clip(f.get('name'), 80), text: clip(f.get('text'), 600), created: Date.now() });
    }
    return send({ ok: true });
  } catch (e) { return send({ error: e.message }, 500); }
}

export async function PATCH(req) {
  if (!authed(req)) return bad();
  try {
    const f = await req.formData(); const type = f.get('type'); const path = pathOf(type, f.get('id'));
    const rec = await getJson(path); if (!rec) return send({ error: 'Not found' }, 404);
    if (type === 'works') {
      rec.title = clip(f.get('title'), 100); rec.description = clip(f.get('description'), 500);
      const file = f.get('file');
      if (file && file.size) { const b = await upImage(file); await del(rec.image).catch(() => {}); rec.image = b.url; }
    } else { rec.name = clip(f.get('name'), 80); rec.text = clip(f.get('text'), 600); }
    await saveJson(path, rec);
    return send({ ok: true });
  } catch (e) { return send({ error: e.message }, 500); }
}

export async function DELETE(req) {
  if (!authed(req)) return bad();
  try {
    const q = new URL(req.url).searchParams; const type = q.get('type');
    if (type === 'hero' || type === 'about') await removeSite(type);
    else {
      const path = pathOf(type, q.get('id')); const rec = await getJson(path);
      if (rec?.image) await del(rec.image).catch(() => {});
      await removeJson(path);
    }
    return send({ ok: true });
  } catch (e) { return send({ error: e.message }, 500); }
}
