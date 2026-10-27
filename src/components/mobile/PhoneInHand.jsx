import { useEffect, useRef, useState } from "react";
import MobileAppPreview from "./MobileAppPreview";
import hand from "../../assets/public/vista-hand-phone.webp";
import { useImageReady } from "../../hooks/useImageReady";
import { Skeleton } from "../loading/Skeleton";

// The real HTML preview stays sharp as the photographic handset changes size.
export default function PhoneInHand() {
  const screenRef = useRef(null);
  const ready = useImageReady(hand);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const resize = () => {
      screen.style.setProperty("--screen-x", screen.clientWidth / 260);
      screen.style.setProperty("--screen-y", screen.clientHeight / 566);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(screen);
    return () => observer.disconnect();
  }, []);

  return <div className={`ga-hand${ready ? " is-ready" : ""}${unavailable ? " is-unavailable" : ""}`} aria-hidden="true">
    {!ready && <div className="ga-hand-loading"><Skeleton height="100%" style={{ borderRadius: 36 }} /></div>}
    <img className="ga-hand-photo" src={hand} alt="" width="1024" height="1536" fetchPriority="high" onError={() => setUnavailable(true)} />
    <div ref={screenRef} className="ga-hand-screen"><MobileAppPreview screen="history" /></div>
  </div>;
}
