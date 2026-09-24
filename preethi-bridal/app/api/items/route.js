import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getWorks, getTestimonials } from '../../../lib/store';
export const dynamic = 'force-dynamic';
const authed = r => !!process.env.ADMIN_PASSWORD && r.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
const no = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req) {
  const t = new URL(req.url).searchParams.get('type');
  if (t === 'auth') return authed(req) ? NextResponse.json({ ok: true }) : no();
  return NextResponse.json(t === 'testimonials' ? await getTestimonials() : await getWorks());
}
export async function POST(req) {
  if (!authed(req)) return no();
  const f = await req.formData();
  const type = f.get('type');
  if (type === 'works' || type === 'hero' || type === 'about') {
    const file = f.get('file');
    const path = type === 'works' ? `works/${Date.now()}.jpg` : `site/${type}-${Date.now()}.jpg`;
    await put(path, file, { access: 'public', contentType: 'image/jpeg' });
  } else {
    const data = JSON.stringify({ name: String(f.get('name')).slice(0, 80), text: String(f.get('text')).slice(0, 600) });
    await put(`testimonials/${Date.now()}.json`, data, { access: 'public', contentType: 'application/json' });
  }
  return NextResponse.json({ ok: true });
}
export async function DELETE(req) {
  if (!authed(req)) return no();
  const url = new URL(req.url).searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
  await del(url);
  return NextResponse.json({ ok: true });
}
