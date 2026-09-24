'use client';
import { useState } from 'react';
export default function Gallery({ works }) {
  const [open, setOpen] = useState(null);
  return (<>
    <div className="gallery">{works.map(w => <img key={w.url} src={w.url} alt="Bridal makeup by Preethi" loading="lazy" onClick={() => setOpen(w.url)} />)}</div>
    {open && <div className="lightbox" onClick={() => setOpen(null)}><img src={open} alt="" /></div>}
  </>);
}
