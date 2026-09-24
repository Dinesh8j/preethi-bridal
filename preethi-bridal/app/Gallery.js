'use client';
import { useState } from 'react';
export default function Gallery({ works }) {
  const [open, setOpen] = useState(null);
  return (<>
    <div className="gallery">{works.map(w => (
      <figure key={w.id} onClick={() => setOpen(w)}>
        <img src={w.image} alt={w.title || 'Bridal makeup by Preethi'} loading="lazy" />
        {w.title && <figcaption><b>{w.title}</b></figcaption>}
      </figure>))}</div>
    {open && <div className="lightbox" onClick={() => setOpen(null)}><figure>
      <img src={open.image} alt={open.title || ''} />
      {(open.title || open.description) && <figcaption><b>{open.title}</b><span>{open.description}</span></figcaption>}
    </figure></div>}
  </>);
}
