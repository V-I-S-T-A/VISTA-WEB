import { ShieldCheck } from "lucide-react";
import CampusArtwork from "./CampusArtwork";
import verticalArtwork from "../../modules/assets/registration_sider.webp";
import "./WorkspaceBanners.css";

export function SystemScopeBanner() {
  return <section className="workspace-scope-banner" aria-label="VISTA system scope">
    <div className="workspace-scope-art"><CampusArtwork /></div>
    <div className="workspace-scope-copy">
      <p className="workspace-scope-label"><ShieldCheck size={19} aria-hidden="true" />System scope</p>
      <h2>Integrated Institutional Document Tracking</h2>
      <p>Ensuring secure, transparent, and efficient document flow for the <strong>Office of Student Affairs.</strong> All processes adhere to institutional compliance standards and data protection protocols.</p>
    </div>
  </section>;
}

export function VerticalBanner() {
  return <aside className="workspace-vertical-banner" aria-hidden="true">
    <img src={verticalArtwork} alt="" loading="lazy" decoding="async" />
  </aside>;
}

export function ProfileBannerLayout({ children }) {
  return <div className="profile-banner-layout">{children}<VerticalBanner /></div>;
}
