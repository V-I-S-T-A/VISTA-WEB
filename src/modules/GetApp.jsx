import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, Check, Cloud, FileCheck2, FileScan, History, ScanLine, Smartphone, UserRound } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/footer";
import MobileAppPreview from "../components/mobile/MobileAppPreview";
import PhoneInHand from "../components/mobile/PhoneInHand";
import { ANDROID_APK_URL, ANDROID_RELEASES_URL } from "../config/appDownload";
import vistaLogo from "../assets/shared/vista_logo.webp";
import downloadQr from "../assets/public/android-download-qr.webp";
import useScrollReveal from "../hooks/useScrollReveal";
import "./GetApp.css";

const FEATURES = [
  { id: "entry", label: "Document entry", icon: FileScan, audience: "For staff", title: "Less paperwork. More progress.", description: "Bring your document into VISTA and give every submission a clear starting point.", points: ["Choose the organization and document type.", "Add the activity details and academic year.", "Capture or attach the document for processing."] },
  { id: "analysis", label: "Smart scanning", icon: ScanLine, audience: "For staff", title: "From a scan to a head start.", description: "Let document analysis suggest the details, then give them a human check before continuing.", points: ["Review information extracted from your document.", "Check names, dates, and document details.", "Correct suggestions before submitting."] },
  { id: "review", label: "Review & feedback", icon: FileCheck2, audience: "For staff", title: "Keep the next step clear.", description: "See the submission, review its details, and help the organization move forward with useful feedback.", points: ["Open the document and submitter details.", "Choose the appropriate review status.", "Leave remarks or revision requirements."] },
  { id: "history", label: "Submission history", icon: History, audience: "For students & staff", title: "A little less wondering.", description: "Find submissions and follow their progress without losing track of the conversation.", points: ["Browse the records available to your account.", "Open a submission to see its details.", "Follow review status and staff feedback."] },
  { id: "drive", label: "Drive sync", icon: Cloud, audience: "For staff", title: "A place for every document.", description: "Connect your authorized Google account to keep your document workflow connected to Drive.", points: ["Authorize the Google Drive connection.", "Choose the destination for your documents.", "Manage the connection from your account."] },
  { id: "profile", label: "Your profile", icon: UserRound, audience: "For students & staff", title: "Make yourself easy to reach.", description: "Keep your account details current so the people working with you have the right information.", points: ["Review your name and email address.", "Keep your contact details up to date.", "Manage your profile in one place."] },
];

const HIGHLIGHTS = [
  { icon: ScanLine, title: "Scan it.", text: "Give paper documents a digital starting point.", color: "blue" },
  { icon: FileCheck2, title: "Review it.", text: "Keep decisions and feedback together.", color: "gold" },
  { icon: History, title: "Track it.", text: "Know where your submission stands.", color: "green" },
  { icon: Cloud, title: "Keep it.", text: "Connect your workflow to Google Drive.", color: "blue" },
];

const INSTALL_STEPS = [
  { title: "Download VISTA", text: "Use the Android download below to get the latest APK from the VISTA release page." },
  { title: "Install on your phone", text: "Open the downloaded APK and follow your Android device’s installation prompts." },
  { title: "Sign in. You’re in.", text: "Use your existing VISTA account. Your role determines the tools and records you can access." },
];

function DownloadLink({ className = "" }) {
  return <a className={`ga-button ga-button-gold ${className}`} href={ANDROID_APK_URL} download="vista-mobile.apk"><ArrowDownToLine size={19} aria-hidden="true" />Download for Android<ArrowUpRight size={17} aria-hidden="true" /></a>;
}

export default function GetApp() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [qrUnavailable, setQrUnavailable] = useState(false);
  const tabRefs = useRef([]);
  const mainRef = useRef(null);
  useScrollReveal(mainRef);
  const activeFeature = FEATURES[activeIndex];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Get the VISTA app | VISTA";
    window.scrollTo(0, 0);
    return () => { document.title = previousTitle; };
  }, []);

  function handleTabKey(event, index) {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % FEATURES.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + FEATURES.length) % FEATURES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FEATURES.length - 1;
    else return;
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return <div className="get-app-page">
    <Header />
    <main ref={mainRef} id="main-content" className="ga-main">
      <section className="public-shell ga-hero" aria-labelledby="ga-title">
        <div className="ga-hero-copy">
          <p className="ga-eyebrow"><span />MEET VISTA MOBILE</p>
          <h1 id="ga-title">Your campus.<br />Your <span className="ga-highlight">VISTA.</span><br />In your pocket.</h1>
          <p className="ga-hero-description">A little less back-and-forth. A lot more done.<br className="ga-desktop-break" /> Keep your document workflow close, wherever campus life takes you.</p>
          <div className="ga-hero-actions"><a className="ga-button ga-button-blue" href="#install"><Smartphone size={19} aria-hidden="true" />Get the app<ArrowRight size={18} aria-hidden="true" /></a><a className="ga-text-link" href="#features">How it works<ArrowDown size={16} aria-hidden="true" /></a></div>
          <p className="ga-platform-note">Android APK <span>·</span> Your existing VISTA account</p>
        </div>
        <div className="ga-hero-visual">
          <div className="ga-orbit ga-orbit-one" aria-hidden="true" /><div className="ga-orbit ga-orbit-two" aria-hidden="true" /><div className="ga-orbit ga-orbit-three" aria-hidden="true" /><span className="ga-spark ga-spark-one" aria-hidden="true">✦</span><span className="ga-spark ga-spark-two" aria-hidden="true">✦</span>
          <PhoneInHand />
          <div className="ga-floating-note" aria-hidden="true"><span><Check size={17} /></span><div><strong>Less chasing. More doing.</strong><small>Your documents, connected.</small></div></div>
        </div>
      </section>

      <div className="public-shell"><div data-reveal className="ga-workflow-band"><div><span className="ga-band-spark" aria-hidden="true">✦</span><strong>Made for campus life.</strong></div><span>Students<ArrowRight size={15} aria-hidden="true" />Staff<ArrowRight size={15} aria-hidden="true" />One connected VISTA.</span><a href="#features">Explore the app<ArrowDown size={16} aria-hidden="true" /></a></div><div className="ga-workflow-tags" aria-label="The document journey"><span><ScanLine size={16} />Capture</span><span><FileCheck2 size={16} />Review</span><span><History size={16} />Follow up</span><span><Cloud size={16} />Stay connected</span></div></div>

      <section className="ga-highlights" aria-labelledby="ga-highlights-title">
        <div className="public-shell">
          <div data-reveal className="ga-section-heading"><p className="ga-eyebrow">LESS FRICTION. MORE FLOW.</p><h2 id="ga-highlights-title">Big on features.<br /><span>Easy to keep close.</span></h2><p>From the first scan to the next update,<br className="ga-desktop-break" /> there’s a place for every step.</p></div>
          <div className="ga-highlight-grid">{HIGHLIGHTS.map(({ icon: Icon, title, text, color }, index) => <div data-reveal style={{ "--reveal-delay": `${index * 70}ms` }} className={`ga-feature-pill ga-feature-pill-${color}`} key={title}><div className="ga-pill-icon"><Icon size={31} strokeWidth={1.7} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></div>)}</div>
        </div>
      </section>

      <section id="features" className="public-shell ga-features" aria-labelledby="ga-features-title">
        <div data-reveal className="ga-section-heading"><p className="ga-eyebrow">A LITTLE TOUR</p><h2 id="ga-features-title">Get to know your <span>VISTA.</span></h2><p>Choose a feature. Take a closer look.</p></div>
        <div data-reveal className="ga-feature-tabs" role="tablist" aria-label="Explore VISTA mobile features">{FEATURES.map(({ id, label, icon: Icon }, index) => <button key={id} ref={node => { tabRefs.current[index] = node; }} type="button" role="tab" id={`feature-tab-${id}`} aria-controls="feature-panel" aria-selected={activeIndex === index} tabIndex={activeIndex === index ? 0 : -1} onClick={() => setActiveIndex(index)} onKeyDown={event => handleTabKey(event, index)}><Icon size={17} aria-hidden="true" />{label}</button>)}</div>
        <div data-reveal className="ga-feature-stage" id="feature-panel" role="tabpanel" aria-labelledby={`feature-tab-${activeFeature.id}`} tabIndex={0}>
          <div key={`preview-${activeFeature.id}`} className="ga-feature-preview ga-feature-enter"><div className="ga-preview-disc" /><MobileAppPreview screen={activeFeature.id} /><span className="ga-preview-index" aria-hidden="true">0{activeIndex + 1}<small>/ 06</small></span></div>
          <div key={`copy-${activeFeature.id}`} className="ga-feature-copy ga-feature-enter"><p className="ga-eyebrow">{activeFeature.audience}</p><h3>{activeFeature.title}</h3><p>{activeFeature.description}</p><ul>{activeFeature.points.map(point => <li key={point}><Check size={17} aria-hidden="true" />{point}</li>)}</ul><a className="ga-text-link" href="#install">Make room for VISTA<ArrowRight size={18} aria-hidden="true" /></a><p className="ga-preview-disclaimer">Illustrative previews with sample data. Available features depend on your account role.</p></div>
        </div>
      </section>

      <section id="install" className="public-shell ga-install" aria-labelledby="ga-install-title">
        <div data-reveal className="ga-section-heading"><p className="ga-eyebrow">YOUR NEXT THREE STEPS</p><h2 id="ga-install-title">A quick hello.<br /><span>Then you’re good to go.</span></h2></div>
        <ol className="ga-install-steps">{INSTALL_STEPS.map((step, index) => <li data-reveal style={{ "--reveal-delay": `${index * 80}ms` }} key={step.title}><span className="ga-step-number">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
        <div data-reveal className="ga-download-panel">
          <div className="ga-download-copy"><div className="ga-app-mark"><img src={vistaLogo} alt="" /><span>VISTA<span>YOUR CAMPUS, CONNECTED.</span></span></div><h2>Ready when<br /><span>you are.</span></h2><p>Take the next step in your document workflow.<br />Get VISTA on your Android phone.</p><DownloadLink /><div className="ga-download-meta"><span>Android · APK download</span><a href={ANDROID_RELEASES_URL} target="_blank" rel="noopener noreferrer">View releases<ArrowUpRight size={14} aria-hidden="true" /></a></div></div>
          <div className="ga-download-qr"><span className="ga-qr-kicker">ON YOUR LAPTOP?</span><div className="ga-qr-paper">{qrUnavailable ? <div className="ga-qr-fallback"><Smartphone size={36} aria-hidden="true" /><p>Open this page on your phone and use “Download for Android.”</p></div> : <img src={downloadQr} width="220" height="220" loading="lazy" alt="Scan to download the VISTA Android APK" onError={() => setQrUnavailable(true)} />}<p>Scan. Download. You’re on your way.</p></div><small>Use your phone’s camera to open the download.</small></div>
        </div>
      </section>

      <section className="public-shell ga-faq" aria-labelledby="ga-faq-title"><div data-reveal><p className="ga-eyebrow">BEFORE YOU GO</p><h2 id="ga-faq-title">A few things<br />you might wonder.</h2><p>Already at your desk?<br /><Link to="/login">Open VISTA on the web<ArrowUpRight size={15} aria-hidden="true" /></Link></p></div><div className="ga-faq-list">
        <details data-reveal><summary>Do I need a new account?<span aria-hidden="true">+</span></summary><p>Use your existing VISTA account. If you don’t have one yet, contact your organization or the VISTA administrator to request access.</p></details>
        <details data-reveal><summary>Can I use this on an iPhone?<span aria-hidden="true">+</span></summary><p>The download on this page is an Android APK. You can use <Link to="/login">VISTA on the web</Link> from your iPhone’s browser.</p></details>
        <details data-reveal><summary>Will everyone see the same features?<span aria-hidden="true">+</span></summary><p>Your role determines your workspace. Students can follow their organization’s submissions, while authorized staff have document entry, review, and Google Drive tools.</p></details>
        <details data-reveal><summary>What if the download doesn’t start?<span aria-hidden="true">+</span></summary><p>Open the <a href={ANDROID_RELEASES_URL} target="_blank" rel="noopener noreferrer">VISTA releases page</a> and look for <strong>vista-mobile.apk</strong> under the latest release’s assets. If the file is unavailable, contact the VISTA administrator.</p></details>
      </div></section>
    </main>
    <Footer />
  </div>;
}
