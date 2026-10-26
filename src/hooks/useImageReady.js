import { useEffect, useState } from 'react';

// Settle on errors too, so a failed decorative image never hides page content.
export function useImageReady(src) {
  const [settledSource, setSettledSource] = useState(null);
  useEffect(() => {
    const image = new Image();
    image.onload = image.onerror = () => setSettledSource(src);
    image.src = src;
    return () => { image.onload = image.onerror = null; };
  }, [src]);
  return settledSource === src;
}
