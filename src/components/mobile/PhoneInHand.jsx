import { useState } from "react";
import hand from "../../assets/public/vista-hand-phone.webp";
import ticket from "../../assets/public/manual/submission-ticket-screen.webp";
import { useImageReady } from "../../hooks/useImageReady";
import { Skeleton } from "../loading/Skeleton";

// Display the supplied submission ticket without recreating its contents.
export default function PhoneInHand() {
  const ready = useImageReady(hand);
  const ticketReady = useImageReady(ticket);
  const [unavailable, setUnavailable] = useState(false);
  const [ticketUnavailable, setTicketUnavailable] = useState(false);

  return <div className={`ga-hand${ready && ticketReady ? " is-ready" : ""}${unavailable ? " is-unavailable" : ""}`} aria-hidden="true">
    {(!ready || !ticketReady) && <div className="ga-hand-loading"><Skeleton height="100%" style={{ borderRadius: 36 }} /></div>}
    <img className="ga-hand-photo" src={hand} alt="" width="1024" height="1536" fetchPriority="high" onError={() => setUnavailable(true)} />
    <div className="ga-hand-screen">{ticketUnavailable ? <div className="ga-hand-screen-fallback">Submission details<br />Preview unavailable</div> : <img className="ga-hand-ticket" src={ticket} alt="" width="1184" height="2540" fetchPriority="high" onError={() => setTicketUnavailable(true)} />}</div>
  </div>;
}
