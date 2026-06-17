import { useState } from 'react'
import vistaLogo from '../assets/shared/vista_logo.png'
import osaLogo from '../assets/shared/osa_logo.png'
import ustpLogo from '../assets/shared/ustp_logo.png'

const SOCIALS = [
  {
    label: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'X',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4l16 16M4 20L20 4" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 7.1C2.5 7.1 2.3 5.4 3 4.6 4 3.5 5.2 3.5 5.8 3.4 8.5 3.2 12 3.2 12 3.2s3.5 0 6.2.2c.6.1 1.8.1 2.8 1.2.7.8.9 2.5.9 2.5s.2 2.1.2 4.2v1.8c0 2.1-.2 4.2-.2 4.2s-.2 1.7-.9 2.5c-1 1.1-2.3 1.1-2.9 1.2-1.8.2-5.9.2-6.1.2h-.1c-2.7 0-6.2-.2-6.2-.2s-.2-1.7-.9-2.5c-.7-.8-.9-2.5-.9-2.5S2.3 11 2.3 8.9V7.1z" />
        <path d="M9.7 14.5l6-3.4-6-3.4v6.8z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const [socialHover, setSocialHover] = useState(null)

  return (
    <footer className="footer">
      <div className="footer-shell">
        <div className="footer-top">
          <div className="footer-left">
            <div className="footer-brand">
              <img src={vistaLogo} alt="" className="footer-logo" aria-hidden="true" />
              <span className="footer-title">V.I.S.T.A.</span>
            </div>
            <p className="footer-description">
              A centralized system for a secure, transparent, and efficient document flow.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-logos">
              <img src={osaLogo} alt="Office of Student Affairs" className="partner-logo" />
              <img src={ustpLogo} alt="University of Science and Technology of Southern Philippines" className="partner-logo" />
            </div>

            <div className="footer-social-row">
              {SOCIALS.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className={`social-btn${socialHover === label ? ' social-btn--hover' : ''}`}
                  onMouseEnter={() => setSocialHover(label)}
                  onMouseLeave={() => setSocialHover(null)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-bottom-left">@ {new Date().getFullYear()} V.I.S.T.A. All rights reserved.</p>
          <p className="footer-bottom-right">
            University of Science and Technology of Southern Philippines - CDO Campus
          </p>
        </div>
      </div>
    </footer>
  )
}
