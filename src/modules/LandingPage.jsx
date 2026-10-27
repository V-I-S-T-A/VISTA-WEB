import { ShieldCheck, RefreshCw } from 'lucide-react'
import backgroundImage from '../assets/public/vista-campus.webp'
import { useImageReady } from '../hooks/useImageReady'
import { LandingHeroSkeleton } from '../components/loading/PageSkeleton'

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
  const imageReady = useImageReady(backgroundImage)
  return (
      <main className="main-content">
        <section
          className="hero-section"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-busy={!imageReady}
        >
          {!imageReady && <div className="skeleton-image-overlay"><LandingHeroSkeleton /></div>}
          {/* Gradient Overlay */}
          <div className="hero-gradient"></div>

          {/* Content */}
          <div className="hero-content" style={{ visibility: imageReady ? 'visible' : 'hidden' }}>
            <div className="hero-text">
              <h1 className="font-display text-white font-bold">
                Turn <span className="text-[#A3C3EE]">Transparency</span> into <span className="text-[#A3C3EE]">Efficiency.</span>
              </h1>
              <p className="font-body text-white">
                Keeps your event documents moving — submit, track, and get feedback in one place,
                so nothing gets lost in the process.
              </p>
            </div>

            <div className="hero-features">
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

  )
}

