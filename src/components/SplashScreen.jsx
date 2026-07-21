import React, { useEffect, useState } from 'react'

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 800)
    const t3 = setTimeout(() => setPhase(3), 1600)
    const t4 = setTimeout(() => setPhase(4), 2400)
    const t5 = setTimeout(() => {
      onFinish()
    }, 3500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [onFinish])

  return (
    <>
      <style>{`
        @keyframes splashOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes splashOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 50px) scale(1.15); }
          66% { transform: translate(40px, -20px) scale(0.85); }
        }
        @keyframes splashOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.2); }
        }
        @keyframes splashMorph {
          0%, 100% { border-radius: 42% 58% 62% 38% / 46% 52% 48% 54%; }
          25% { border-radius: 54% 46% 38% 62% / 58% 42% 58% 42%; }
          50% { border-radius: 38% 62% 54% 46% / 42% 58% 42% 58%; }
          75% { border-radius: 62% 38% 46% 54% / 52% 48% 54% 46%; }
        }
        @keyframes splashGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes splashScanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes splashLetterReveal {
          0% { opacity: 0; transform: translateY(18px) scale(0.8); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes splashBarGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(139, 92, 246, 0.3); }
        }
        @keyframes splashParticleFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-120px) rotate(180deg); opacity: 0; }
        }
        @keyframes splashRingExpand {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0f2e 25%, #1a103c 50%, #0d1b2a 75%, #0a0a1a 100%)',
        }}>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
            animation: 'splashOrb1 8s ease-in-out infinite, splashMorph 12s ease-in-out infinite',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-15%', right: '-10%',
            width: 450, height: 450,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            animation: 'splashOrb2 10s ease-in-out infinite, splashMorph 15s ease-in-out infinite reverse',
            filter: 'blur(50px)',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
            animation: 'splashOrb3 7s ease-in-out infinite',
            filter: 'blur(60px)',
            transform: 'translateX(-50%)',
          }} />
        </div>

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: phase >= 1 ? 0.8 : 0,
          transition: 'opacity 1s ease',
        }} />

        {/* Scanning line effect */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)',
          animation: 'splashScanline 3s linear infinite',
          opacity: phase >= 1 ? 0.5 : 0,
        }} />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              borderRadius: '50%',
              background: ['#818cf8', '#a78bfa', '#38bdf8', '#34d399', '#c084fc'][i % 5],
              bottom: `${Math.random() * 30}%`,
              left: `${5 + i * 8}%`,
              animation: `splashParticleFloat ${3 + Math.random() * 4}s ${i * 0.4}s ease-in-out infinite`,
              opacity: phase >= 1 ? 1 : 0,
            }}
          />
        ))}

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-7 px-8">

          {/* Logo mark */}
          <div
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
            }}
          >
            {/* Pulsing rings */}
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              animation: phase >= 1 ? 'splashRingExpand 2.5s ease-out infinite' : 'none',
            }} />
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              animation: phase >= 1 ? 'splashRingExpand 2.5s 0.8s ease-out infinite' : 'none',
            }} />

            {/* Main logo container */}
            <div style={{
              width: 90, height: 90,
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              {/* Inner glow */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3), transparent 60%)',
                animation: 'splashGlow 3s ease-in-out infinite',
              }} />

              {/* SM letters */}
              <div style={{
                position: 'relative', zIndex: 2,
                fontFamily: "'Inter', sans-serif",
                fontSize: 32, fontWeight: 900,
                background: 'linear-gradient(135deg, #e0e7ff, #fff, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 2,
                textShadow: 'none',
              }}>
                SM
              </div>

              {/* Corner accents */}
              <div style={{ position: 'absolute', top: 6, left: 6, width: 8, height: 8, borderTop: '2px solid rgba(139, 92, 246, 0.5)', borderLeft: '2px solid rgba(139, 92, 246, 0.5)', borderRadius: '2px 0 0 0' }} />
              <div style={{ position: 'absolute', bottom: 6, right: 6, width: 8, height: 8, borderBottom: '2px solid rgba(99, 102, 241, 0.5)', borderRight: '2px solid rgba(99, 102, 241, 0.5)', borderRadius: '0 0 2px 0' }} />
            </div>
          </div>

          {/* Brand name with letter-by-letter reveal */}
          <div
            style={{
              textAlign: 'center',
              opacity: phase >= 2 ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(1.8rem, 6vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 6,
            }}>
              {'SM Brac Panel'.split('').map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    background: char === ' ' ? 'none' : 'linear-gradient(135deg, #e0e7ff 0%, #fff 40%, #c4b5fd 100%)',
                    WebkitBackgroundClip: char === ' ' ? 'unset' : 'text',
                    WebkitTextFillColor: char === ' ' ? 'transparent' : 'transparent',
                    width: char === ' ' ? '0.3em' : 'auto',
                    animation: phase >= 2 ? `splashLetterReveal 0.5s ${i * 0.04}s ease-out forwards` : 'none',
                    opacity: phase >= 2 ? undefined : 0,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p style={{
              fontFamily: "'Hind Siliguri', sans-serif",
              fontSize: 'clamp(0.85rem, 3vw, 1.1rem)',
              color: 'rgba(148, 163, 184, 0.8)',
              fontWeight: 400,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: phase >= 3 ? 1 : 0,
              transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s ease-out',
            }}>
              সদস্য ব্যবস্থাপনা সিস্টেম
            </p>
          </div>

          {/* Modern progress bar */}
          <div
            style={{
              width: 220,
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.5s ease-out 0.2s',
            }}
          >
            <div style={{
              height: 3,
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 4,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                width: phase >= 4 ? '100%' : phase >= 3 ? '70%' : phase >= 2 ? '35%' : '0%',
                transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'splashBarGlow 2s ease-in-out infinite',
                position: 'relative',
              }}>
                {/* Shimmer effect on bar */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }} />
              </div>
            </div>

            {/* Status text */}
            <p style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: 11,
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(148, 163, 184, 0.5)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {phase >= 4 ? 'Ready' : phase >= 3 ? 'Loading...' : 'Initializing'}
            </p>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3), transparent)',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 1s ease',
        }} />
      </div>
    </>
  )
}

export default SplashScreen
