import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, Check, Cloud, FileCheck2, History, ScanLine, Smartphone } from "lucide-react";
import GetAppGuide from "../components/mobile/GetAppGuide";
import PhoneInHand from "../components/mobile/PhoneInHand";
import GetAppPromo from "../components/mobile/GetAppPromo";
import { ANDROID_APK_URL, ANDROID_RELEASES_URL, ANDROID_VERSION_LABEL } from "../config/appDownload";
import vistaLogo from "../assets/shared/vista_logo.webp";
import downloadQr from "../assets/public/vista_v1.0.8.webp";
import useScrollReveal from "../hooks/useScrollReveal";
import "./GetApp.css";

const HIGHLIGHTS = [
  { icon: ScanLine, title: "Scan it.", text: "Give paper documents a digital starting point.", color: "blue" },
  { icon: FileCheck2, title: "Review it.", text: "Keep decisions and feedback together.", color: "gold" },
  { icon: History, title: "Track it.", text: "Know where your submission stands.", color: "green" },
  { icon: Cloud, title: "Keep it.", text: "Connect your workflow to Google Drive.", color: "blue" },
];

const INSTALL_STEPS = [
  { title: "Download VISTA", text: "Use the Android download below to get the latest VISTA production APK." },
  { title: "Install on your phone", text: "Open the downloaded APK and follow your Android device’s installation prompts." },
  { title: "Sign in. You’re in.", text: "Use your existing VISTA account. Your role determines the tools and records you can access." },
];

function DownloadLink({ className = "" }) {
  return <a className={`ga-button ga-button-blue ${className}`} href={ANDROID_APK_URL}><ArrowDownToLine size={19} aria-hidden="true" />Download for Android<ArrowUpRight size={17} aria-hidden="true" /></a>;
}

export default function GetApp() {
  const [qrUnavailable, setQrUnavailable] = useState(false);
  const mainRef = useRef(null);
  useScrollReveal(mainRef);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Get the VISTA app | VISTA";
    return () => { document.title = previousTitle; };
  }, []);

  return <main ref={mainRef} id="main-content" className="ga-main">
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

      <GetAppPromo />

      <section className="ga-highlights" aria-labelledby="ga-highlights-title">
        <div className="public-shell">
          <div data-reveal className="ga-section-heading"><p className="ga-eyebrow">LESS FRICTION. MORE FLOW.</p><h2 id="ga-highlights-title">Big on features.<br /><span>Easy to keep close.</span></h2><p>From the first scan to the next update,<br className="ga-desktop-break" /> there’s a place for every step.</p></div>
          <div className="ga-highlight-grid">{HIGHLIGHTS.map(({ icon: Icon, title, text, color }, index) => <div data-reveal style={{ "--reveal-delay": `${index * 70}ms` }} className={`ga-feature-pill ga-feature-pill-${color}`} key={title}><div className="ga-pill-icon"><Icon size={31} strokeWidth={1.7} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></div>)}</div>
        </div>
      </section>

      <section id="features" className="public-shell ga-features" aria-labelledby="ga-features-title">
        <div data-reveal className="ga-section-heading"><p className="ga-eyebrow">YOUR MOBILE MANUAL</p><h2 id="ga-features-title">Get to know your <span>VISTA.</span></h2><p>Choose your role. Follow the steps with a screen beside you.</p></div>
        <GetAppGuide />
      </section>

      <section id="install" className="public-shell ga-install" aria-labelledby="ga-install-title">
        <div data-reveal className="ga-section-heading"><p className="ga-eyebrow">YOUR NEXT THREE STEPS</p><h2 id="ga-install-title">A quick hello.<br /><span>Then you’re good to go.</span></h2></div>
        <ol className="ga-install-steps">{INSTALL_STEPS.map((step, index) => <li data-reveal style={{ "--reveal-delay": `${index * 80}ms` }} key={step.title}><span className="ga-step-number">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
        <div data-reveal className="ga-download-panel">
          <div className="ga-download-copy"><div className="ga-app-mark"><img src={vistaLogo} alt="" /><span>VISTA<span>YOUR CAMPUS, CONNECTED.</span></span></div><h2>Ready when<br /><span>you are.</span></h2><p>Take the next step in your document workflow.<br />Get VISTA on your Android phone.</p><DownloadLink /><div className="ga-download-meta"><span>Android · {ANDROID_VERSION_LABEL}</span><a href={ANDROID_RELEASES_URL} target="_blank" rel="noopener noreferrer">View build details<ArrowUpRight size={14} aria-hidden="true" /></a></div></div>
          <div className="ga-download-qr"><span className="ga-qr-kicker">ON YOUR LAPTOP?</span><div className="ga-qr-paper">{qrUnavailable ? <div className="ga-qr-fallback"><Smartphone size={36} aria-hidden="true" /><p>Open this page on your phone and use “Download for Android.”</p></div> : <img src={downloadQr} width="220" height="220" loading="lazy" alt="Scan to download the VISTA Android APK" onError={() => setQrUnavailable(true)} />}<p>Scan. Download. You’re on your way.</p></div><small>Use your phone’s camera to open the download.</small></div>
        </div>
      </section>

      <section className="public-shell ga-faq" aria-labelledby="ga-faq-title"><div data-reveal><p className="ga-eyebrow">BEFORE YOU GO</p><h2 id="ga-faq-title">A few things<br />you might wonder.</h2><p>Already at your desk?<br /><Link to="/login">Open VISTA on the web<ArrowUpRight size={15} aria-hidden="true" /></Link></p></div><div className="ga-faq-list">
        <details data-reveal><summary>Do I need a new account?<span aria-hidden="true">+</span></summary><p>Use your existing VISTA account. If you don’t have one yet, contact your organization or the VISTA administrator to request access.</p></details>
        <details data-reveal><summary>Can I use this on an iPhone?<span aria-hidden="true">+</span></summary><p>The download on this page is an Android APK. You can use <Link to="/login">VISTA on the web</Link> from your iPhone’s browser.</p></details>
        <details data-reveal><summary>Will everyone see the same features?<span aria-hidden="true">+</span></summary><p>Your role determines your workspace. Students can follow their organization’s submissions, while authorized staff have document entry, review, and Google Drive tools.</p></details>
        <details data-reveal><summary>What if the download doesn’t start?<span aria-hidden="true">+</span></summary><p>Open the <a href={ANDROID_RELEASES_URL} target="_blank" rel="noopener noreferrer">VISTA Android build page</a> and use the installation option to get the APK. If the file is unavailable, contact the VISTA administrator.</p></details>
      </div></section>
    </main>;
}
