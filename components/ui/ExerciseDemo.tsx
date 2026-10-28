import React, { useState } from 'react';
import { Dumbbell, Play } from 'lucide-react';

/** Keyed by exercise in the caller so failures never leak to another movement. */
export function ExerciseDemo({ name, gif, thumbnail }: { name: string; gif?: string; thumbnail?: string }) {
  const [gifFailed, setGifFailed] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const animated = !!gif && !gifFailed;
  const source = animated ? gif : !thumbnailFailed ? thumbnail : undefined;
  return <figure className="redesign-demo" aria-label={animated ? 'Demonstração animada, não validada tecnicamente' : 'Demonstração do exercício'}>
    {source ? <img key={source} src={source} alt={name} decoding="async" loading="eager" onLoad={() => setLoaded(true)} onError={() => { setLoaded(false); if (animated) setGifFailed(true); else setThumbnailFailed(true); }}/> : <Dumbbell size={60} aria-hidden="true"/>}
    <figcaption><Play size={17} aria-hidden="true"/><span>{animated ? (loaded ? 'GIF · revisão técnica pendente' : 'Carregando GIF · revisão técnica pendente') : gifFailed || !source ? 'Demonstração indisponível' : 'Demonstração · GIF em breve'}</span></figcaption>
  </figure>;
}
