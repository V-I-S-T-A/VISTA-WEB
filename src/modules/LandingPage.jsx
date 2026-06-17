import { ShieldCheck, RefreshCw } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import backgroundImage from '../assets/shared/vista_background.png'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description: 'Your data is protected 24/7.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time updates',
    description: 'Get live updates on processing status.',
  },
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />

      <main className="main-content">
        <section
          className="hero-section"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Gradient Overlay */}
          <div className="hero-gradient"></div>

          {/* Content */}
          <div className="hero-content">
            <div className="hero-text max-w-[700px] relative top-[230px]">
              <h1 className="font-hahmlet text-white font-semibold">
                Turn <span className="text-[#A3C3EE]">Transparency</span> into <span className="text-[#A3C3EE]">Efficiency.</span>
              </h1>
              <p className="font-jakarta text-white ">
                Keeps your event documents moving — submit, track, and get feedback in one place,
                so nothing gets lost in the process.
              </p>
            </div>

            <div className="hero-features relative top-[-50px]">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="feature-icon mt-0.5 text-white" strokeWidth={1.5} aria-hidden="true" />
                  <div className="font-inter text-white">
                    <p className="feature-title">{title}</p>
                    <p className="feature-desc text-white">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

