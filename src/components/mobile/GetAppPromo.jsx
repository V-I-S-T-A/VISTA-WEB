import { useEffect, useRef, useState } from 'react';
import { PictureInPicture2 } from 'lucide-react';
import promo from '../../assets/public/vista-promo.webm';
import poster from '../../assets/public/vista-promo-poster.webp';

export default function GetAppPromo() {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [poppedOut, setPoppedOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const enter = () => setPoppedOut(true);
    const leave = () => setPoppedOut(false);
    const presentation = () => setPoppedOut(video.webkitPresentationMode === 'picture-in-picture');
    video.addEventListener('enterpictureinpicture', enter);
    video.addEventListener('leavepictureinpicture', leave);
    video.addEventListener('webkitpresentationmodechanged', presentation);
    return () => {
      video.removeEventListener('enterpictureinpicture', enter);
      video.removeEventListener('leavepictureinpicture', leave);
      video.removeEventListener('webkitpresentationmodechanged', presentation);
      video.pause();
      if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
      else if (video.webkitPresentationMode === 'picture-in-picture') video.webkitSetPresentationMode('inline');
    };
  }, []);

  return <section className="public-shell ga-promo" aria-label="VISTA promotional video">
    <div className="ga-promo-player">
      <video ref={videoRef} src={promo} controls playsInline preload="metadata" poster={poster} aria-label="VISTA promotional video" onError={() => setFailed(true)}>
        Your browser cannot play this video. <a href={promo}>Open the VISTA promo video</a>.
      </video>
      {poppedOut && <div className="ga-promo-popped" role="status"><PictureInPicture2 size={28} aria-hidden="true" /><p>Playing in video pop-out</p></div>}
      {failed && <div className="ga-promo-error" role="alert"><p>The video could not load.</p><a href={promo} target="_blank" rel="noopener noreferrer">Open the promo video</a></div>}
    </div>
  </section>;
}
