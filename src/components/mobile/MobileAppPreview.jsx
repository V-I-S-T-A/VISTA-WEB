import { BatteryFull, Camera, ChevronDown, ChevronLeft, Cloud, Home, MessageSquareText, ScanLine, Search, ShieldCheck, Signal, SlidersHorizontal, UserRound, UserRoundCheck, Wifi } from "lucide-react";
import vistaLogo from "../../assets/shared/vista_logo.webp";
import campus from "../../assets/shared/vista_background.webp";

const TITLES = {
  entry: ["Document Entry", "Registration Portal."],
  analysis: ["Analysis Results", "Review extracted document information."],
  review: ["Review Panel", "Updating submitted document status."],
  history: ["Submission History", "Review all submissions."],
  drive: ["Google Drive Sync", "Sync your Google Drive account."],
  profile: ["Edit Profile", "Keep your details up to date."],
};

function Field({ label, value, select = false }) {
  return <div className="mp-field"><span>{label}</span><div>{value}{select && <ChevronDown size={13} />}</div></div>;
}

function EntryScreen() {
  return <div className="mp-card mp-entry-form">
    <Field label="Organization" value="Select organization…" select />
    <Field label="Document type" value="Select type…" select />
    <Field label="Category" value="Select category…" select />
    <Field label="Document title" value="Enter document title…" />
    <Field label="Academic year" value="Select academic year…" select />
    <div className="mp-upload"><Camera size={23} /><span>Add your document</span></div>
  </div>;
}

function AnalysisScreen() {
  return <><div className="mp-back"><ChevronLeft size={10} />Back</div>
    <div className="mp-analysis-status"><div><b>Document analysis</b><span>PROCESSED</span></div><strong>Ready for your review</strong><div className="mp-progress" /></div>
    <div className="mp-scan-image"><img src={campus} alt="" /><span>Source: sample-document.pdf</span></div>
    <h4 className="mp-blue-title">EXTRACTED STRUCTURED DATA</h4>
    <div className="mp-card mp-data"><small>SUBMITTER NAME</small><strong>Alex Rivera</strong><small>DOCUMENT TITLE</small><strong>Annual Activity Proposal</strong><small>ACADEMIC YEAR</small><strong>2026–2027</strong></div>
  </>;
}

function ReviewScreen() {
  return <><div className="mp-back"><ChevronLeft size={10} />Back</div>
    <h4 className="mp-blue-title mp-document-title">Campus Club: Annual Activity Proposal</h4>
    <div className="mp-card mp-submitter"><div className="mp-submitter-name"><span className="mp-club-avatar">CC</span><div><small>SUBMITTER DETAILS</small><strong>Alex Rivera</strong></div></div><dl><div><dt>Organization</dt><dd>Campus Club</dd></div><div><dt>Email</dt><dd>alex@example.com</dd></div><div><dt>Submitted on</dt><dd>Oct 24, 2026</dd></div></dl></div>
    <div className="mp-card"><Field label="Document status" value="Select status…" select /><div className="mp-field"><span>Reviewer remarks</span><div className="mp-textarea">Enter notes or revision requirements…</div></div></div>
  </>;
}

function HistoryScreen() {
  return <><div className="mp-back"><ChevronLeft size={10} />Back</div><div className="mp-search"><Search size={11} /><span>Search submissions…</span><b>Filter</b></div>
    {["Annual Activity Proposal", "Accomplishment Report", "Event Documentation", "Activity Proposal"].map((title, i) => <div className="mp-card mp-history-row" key={title}><span className={`mp-club-avatar mp-club-${i}`}>{["CC", "AC", "SC", "CC"][i]}</span><div><strong>{title}</strong><span>Alex Rivera</span><small>alex@example.com</small><footer><span>24 OCT 2026</span><b>View details</b></footer></div></div>)}
  </>;
}

function DriveScreen() {
  return <><div className="mp-drive-banner">SECURE INTEGRATION</div><h4 className="mp-drive-heading">Powering Institutional <em>Efficiency</em></h4><p className="mp-muted">Connect your professional workspace to VISTA. Keep documents organized in your institutional Google Drive.</p><div className="mp-drive-benefit"><Cloud /><div><strong>Automated Archiving</strong><p>Keep scanned files in your selected Drive folders.</p></div></div><div className="mp-drive-benefit"><ShieldCheck /><div><strong>Secure Connection</strong><p>Authorize access with your Google account.</p></div></div><div className="mp-card mp-drive-connect"><ScanLine size={34} /><strong>Your documents, connected.</strong><span>Connect Google Drive</span></div></>;
}

function ProfileScreen() {
  return <div className="mp-profile"><div className="mp-profile-avatar"><UserRound size={46} /><span><Camera size={13} /></span></div><h4>Edit Profile</h4><div className="mp-profile-field">Alex</div><div className="mp-profile-field">Rivera</div><div className="mp-profile-field">alex@example.com</div><div className="mp-profile-field">+63 · Phone number</div><div className="mp-profile-pair"><span>Date of birth</span><span>Gender</span></div><div className="mp-profile-actions"><span>Update Profile</span><span>Cancel</span></div></div>;
}

const SCREENS = { entry: EntryScreen, analysis: AnalysisScreen, review: ReviewScreen, history: HistoryScreen, drive: DriveScreen, profile: ProfileScreen };

// Recreated from the supplied Figma screens. All identities are fictional;
// no original screenshot, personal name, email, or profile photo is published.
export default function MobileAppPreview({ screen = "entry", className = "" }) {
  const Screen = SCREENS[screen];
  const [title, subtitle] = TITLES[screen];
  return <div className={`mp-phone ${className}`} role="img" aria-label={`Illustrative VISTA mobile ${title} preview with sample data`}>
    <div className="mp-display" aria-hidden="true">
      <div className="mp-status"><span>9:41</span><div><Signal size={11} /><Wifi size={11} /><BatteryFull size={14} /></div></div>
      <div className="mp-camera" />
      {screen !== "profile" ? <><div className="mp-app-header"><span className="mp-avatar"><UserRound size={16} /></span><img src={vistaLogo} alt="" /><SlidersHorizontal size={18} /></div><div className="mp-content"><h3>{title}</h3><p className="mp-subtitle">{subtitle}</p><Screen /></div></> : <><div className="mp-profile-back"><ChevronLeft size={18} /></div><Screen /></>}
      {screen !== "profile" && <div className="mp-bottom-nav"><Home /><UserRoundCheck className={screen === "entry" || screen === "analysis" ? "mp-active" : ""} /><span className="mp-scan-button"><ScanLine /></span><MessageSquareText className={screen === "review" ? "mp-active" : ""} /><Cloud className={screen === "drive" ? "mp-active" : ""} /></div>}
      <div className="mp-home-indicator" />
    </div>
  </div>;
}
