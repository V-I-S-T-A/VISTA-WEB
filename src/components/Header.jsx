import { useNavigate } from 'react-router-dom'
import { ArrowRight, Download } from 'lucide-react'
import vistaLogo from '../assets/shared/vista_logo.png'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-left">
        <div onClick={() => navigate('/')} className="header-brand-link" style={{ cursor: 'pointer' }}>
          <h1 className="text-[#1A51A5] font-dm-sans font-black text-lg text-[24px]">V.I.S.T.A.</h1>
        </div>
      </div>
      <div className="header-right">
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Login
          <ArrowRight className="btn-icon" aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-outline">
          Get the app
          <Download className="btn-icon" aria-hidden="true" />
        </button>
        <img src={vistaLogo} alt="" className="header-profile-icon" aria-hidden="true" />
      </div>
    </header>
  )
}
