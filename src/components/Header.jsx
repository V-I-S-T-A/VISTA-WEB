import { Link } from 'react-router-dom'
import { ArrowRight, Download } from 'lucide-react'
import vistaLogo from '../assets/shared/vista_logo.png'

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-brand-link">
          <img src={vistaLogo} alt="V.I.S.T.A." className="header-brand-logo" />
        </Link>
        <h1 className="text-[#1A51A5] font-dm-sans font-black text-lg">V.I.S.T.A.</h1>
      </div>
      <div className="header-right">
        <Link to="/login" className="btn btn-primary">
          Login
          <ArrowRight className="btn-icon" aria-hidden="true" />
        </Link>
        <button type="button" className="btn btn-outline">
          Get the app
          <Download className="btn-icon" aria-hidden="true" />
        </button>
        <img src={vistaLogo} alt="" className="header-profile-icon" aria-hidden="true" />
      </div>
    </header>
  )
}
