'use client';
import { useState } from 'react';

async function shrink(file) {
  const img = await createImageBitmap(file);
  const s = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
}

export default function Admin() {
  const [pw, setPw] = useState(''); const [ok, setOk] = useState(false); const [msg, setMsg] = useState('');
  const [works, setWorks] = useState([]); const [revs, setRevs] = useState([]); const [site, setSite] = useState({});
  const [w, setW] = useState({ title: '', description: '', file: null }); const [fk, setFk] = useState(0);
  const [r, setR] = useState({ name: '', text: '' });
  const [cfg, setCfg] = useState({ whatsapp: '', instagram: '' });
  const [ed, setEd] = useState(null); // item being edited: {type, id, ...fields}
  const H = { 'x-admin-password': pw };

  const api = async (method, qs, body) => {
    const res = await fetch('/api/items' + qs, { method, headers: H, body, cache: 'no-store' });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || res.statusText);
    return d;
  };
  const form = async o => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(o)) {
      if (v instanceof File) fd.append(k, await shrink(v), 'w.jpg'); else if (v != null) fd.append(k, v);
    }
    return fd;
  };
  const load = async () => {
    try { setWorks(await api('GET', '?type=works')); setRevs(await api('GET', '?type=testimonials')); setSite(await api('GET', '?type=site')); setCfg(await api('GET', '?type=settings')); }
    catch (e) { setMsg('Error: ' + e.message); }
  };
  const run = async (label, fn) => {
    setMsg(label + '...');
    try { await fn(); setMsg('Saved'); await load(); } catch (e) { setMsg('Error: ' + e.message); }
  };
  const login = async () => { try { await api('GET', '?type=auth'); setOk(true); setMsg(''); load(); } catch (e) { setMsg('Error: ' + e.message); } };
  const del = (type, id) => confirm('Delete this permanently?') && run('Deleting', () => api('DELETE', `?type=${type}&id=${id}`));

  if (!ok) return <div className="admin"><h2>Admin login</h2>
    <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
    <button className="btn" onClick={login}>Login</button><p className="err">{msg}</p></div>;

  return <div className="admin">
    <h1>Admin</h1><p className={msg.startsWith('Error') ? 'err' : 'ok'}>{msg}</p>

    <h2>Contact details</h2>
    <div className="box">
      <p>WhatsApp number (country code + number, no + or spaces, e.g. 919876543210)</p>
      <input value={cfg.whatsapp} onChange={e => setCfg({ ...cfg, whatsapp: e.target.value })} />
      <p>Instagram username (without @)</p>
      <input value={cfg.instagram} onChange={e => setCfg({ ...cfg, instagram: e.target.value })} />
      <button className="btn" onClick={() => run('Saving', async () => api('POST', '', await form({ type: 'settings', ...cfg })))}>Save details</button></div>

    <h2>Site photos</h2>
    {['hero', 'about'].map(k => <div className="row" key={k}>
      {site[k] ? <img src={site[k]} alt="" /> : <div className="thumb" />}
      <div style={{ flex: 1 }}><b>{k === 'hero' ? 'Main banner photo' : 'About portrait'}</b>
        <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) run('Uploading', async () => api('POST', '', await form({ type: k, file: f }))); e.target.value = ''; }} /></div>
      {site[k] && <button className="btn alt" onClick={() => confirm('Remove this photo?') && run('Removing', () => api('DELETE', `?type=${k}`))}>Remove</button>}
    </div>)}

    <h2>Recent works</h2>
    <div className="box"><b>Add new work</b>
      <input placeholder="Title (e.g. South Indian Bride)" value={w.title} onChange={e => setW({ ...w, title: e.target.value })} />
      <textarea rows={2} placeholder="Description" value={w.description} onChange={e => setW({ ...w, description: e.target.value })} />
      <input key={fk} type="file" accept="image/*" onChange={e => setW({ ...w, file: e.target.files[0] })} />
      <button className="btn" onClick={() => w.file ? run('Uploading', async () => { await api('POST', '', await form({ type: 'works', ...w })); setW({ title: '', description: '', file: null }); setFk(k => k + 1); }) : setMsg('Error: choose a photo first')}>Add work</button></div>
    {works.map(x => ed?.type === 'works' && ed.id === x.id
      ? <div className="box" key={x.id}><img src={x.image} alt="" />
          <input placeholder="Title" value={ed.title} onChange={e => setEd({ ...ed, title: e.target.value })} />
          <textarea rows={2} placeholder="Description" value={ed.description} onChange={e => setEd({ ...ed, description: e.target.value })} />
          <p>Replace photo (optional)</p><input type="file" accept="image/*" onChange={e => setEd({ ...ed, file: e.target.files[0] })} />
          <button className="btn" onClick={() => run('Saving', async () => { await api('PATCH', '', await form({ type: 'works', id: x.id, title: ed.title, description: ed.description, file: ed.file })); setEd(null); })}>Save</button>
          <button className="btn alt" onClick={() => setEd(null)}>Cancel</button></div>
      : <div className="row" key={x.id}><img src={x.image} alt="" />
          <div style={{ flex: 1 }}><b>{x.title || 'Untitled'}</b><p>{x.description}</p></div>
          <button className="btn alt" onClick={() => setEd({ type: 'works', id: x.id, title: x.title, description: x.description })}>Edit</button>
          <button className="btn alt" onClick={() => del('works', x.id)}>Delete</button></div>)}

    <h2>Testimonials</h2>
    <div className="box"><b>Add testimonial</b>
      <input placeholder="Client name" value={r.name} onChange={e => setR({ ...r, name: e.target.value })} />
      <textarea rows={3} placeholder="Review text" value={r.text} onChange={e => setR({ ...r, text: e.target.value })} />
      <button className="btn" onClick={() => r.name && r.text ? run('Saving', async () => { await api('POST', '', await form({ type: 'testimonials', ...r })); setR({ name: '', text: '' }); }) : setMsg('Error: enter name and review')}>Add testimonial</button></div>
    {revs.map(x => ed?.type === 'testimonials' && ed.id === x.id
      ? <div className="box" key={x.id}>
          <input value={ed.name} onChange={e => setEd({ ...ed, name: e.target.value })} />
          <textarea rows={3} value={ed.text} onChange={e => setEd({ ...ed, text: e.target.value })} />
          <button className="btn" onClick={() => run('Saving', async () => { await api('PATCH', '', await form({ type: 'testimonials', id: x.id, name: ed.name, text: ed.text })); setEd(null); })}>Save</button>
          <button className="btn alt" onClick={() => setEd(null)}>Cancel</button></div>
      : <div className="row" key={x.id}><div style={{ flex: 1 }}>“{x.text}” — <b>{x.name}</b></div>
          <button className="btn alt" onClick={() => setEd({ type: 'testimonials', id: x.id, name: x.name, text: x.text })}>Edit</button>
          <button className="btn alt" onClick={() => del('testimonials', x.id)}>Delete</button></div>)}
  </div>;
}
