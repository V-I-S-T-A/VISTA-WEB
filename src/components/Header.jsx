import { useNavigate } from 'react-router-dom'
import { ArrowRight, Download } from 'lucide-react'
import vistaLogo from '../assets/shared/vista_logo.png'
import { getHeaderConfig } from '../config/navigation'

export default function Header({ layout = 'public' }) {
  const navigate = useNavigate()
  const config = getHeaderConfig(layout)

  if (config.type === 'dashboard') {
    return (
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <h1 className="font-inter text-sm font-medium text-[#1a51a5]">{config.title}</h1>
        <img
          src={config.avatar}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover"
        />
      </header>
    )
  }

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="header-brand-link cursor-pointer border-none bg-transparent p-0"
        >
          <h1 className="font-inter text-2xl font-black text-[#1A51A5]">V.I.S.T.A.</h1>
        </button>
      </div>
      <div className="header-right">
        <button type="button" onClick={() => navigate('/login')} className="btn btn-primary">
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
