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
  const [pw, setPw] = useState(''); const [ok, setOk] = useState(false);
  const [works, setWorks] = useState([]); const [revs, setRevs] = useState([]);
  const [msg, setMsg] = useState(''); const [name, setName] = useState(''); const [text, setText] = useState('');
  const H = { 'x-admin-password': pw };
  const load = async () => {
    setWorks(await (await fetch('/api/items?type=works', { cache: 'no-store' })).json());
    setRevs(await (await fetch('/api/items?type=testimonials', { cache: 'no-store' })).json());
  };
  const login = async () => { const r = await fetch('/api/items?type=auth', { headers: H }); if (r.ok) { setOk(true); load(); } else setMsg('Wrong password'); };
  const upload = async e => {
    setMsg('Uploading...');
    for (const f of e.target.files) {
      const fd = new FormData(); fd.append('type', 'works'); fd.append('file', await shrink(f), 'w.jpg');
      await fetch('/api/items', { method: 'POST', headers: H, body: fd });
    }
    e.target.value = ''; setMsg('Uploaded'); load();
  };
  const uploadOne = async (kind, e) => {
    const f = e.target.files[0]; if (!f) return; setMsg('Uploading...');
    const fd = new FormData(); fd.append('type', kind); fd.append('file', await shrink(f), 'w.jpg');
    await fetch('/api/items', { method: 'POST', headers: H, body: fd }); e.target.value = ''; setMsg('Updated. Refresh the home page to see it.');
  };
  const addRev = async () => {
    if (!name || !text) return;
    const fd = new FormData(); fd.append('type', 'testimonials'); fd.append('name', name); fd.append('text', text);
    await fetch('/api/items', { method: 'POST', headers: H, body: fd });
    setName(''); setText(''); load();
  };
  const remove = async url => { if (confirm('Delete?')) { await fetch('/api/items?url=' + encodeURIComponent(url), { method: 'DELETE', headers: H }); load(); } };
  if (!ok) return <div className="admin"><h2>Admin login</h2>
    <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
    <button className="btn" onClick={login}>Login</button><p>{msg}</p></div>;
  return <div className="admin">
    <h2>Site photos</h2><p>Main banner (hero) photo</p><input type="file" accept="image/*" onChange={e => uploadOne('hero', e)} /><p>About / portrait photo</p><input type="file" accept="image/*" onChange={e => uploadOne('about', e)} />
    <h2 style={{ marginTop: 30 }}>Recent works</h2><input type="file" accept="image/*" multiple onChange={upload} /><p>{msg}</p>
    {works.map(w => <div className="row" key={w.url}><img src={w.url} alt="" /><button className="btn alt" onClick={() => remove(w.url)}>Delete</button></div>)}
    <h2 style={{ marginTop: 30 }}>Testimonials</h2>
    <input placeholder="Client name" value={name} onChange={e => setName(e.target.value)} />
    <textarea rows={3} placeholder="Review text" value={text} onChange={e => setText(e.target.value)} />
    <button className="btn" onClick={addRev}>Add testimonial</button>
    {revs.map(r => <div className="row" key={r.url}><span>“{r.text}” — <b>{r.name}</b></span><button className="btn alt" onClick={() => remove(r.url)}>Delete</button></div>)}
  </div>;
}
