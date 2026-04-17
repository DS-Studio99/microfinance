import React, { useEffect, useState } from 'react'

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1000)
    const t3 = setTimeout(() => setPhase(3), 2000)
    const t4 = setTimeout(() => {
      onFinish()
    }, 3500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onFinish])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }}>

      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', animation: 'spin 15s linear infinite' }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)', animation: 'spin 12s linear infinite reverse' }} />
        <div className="absolute top-1/2 left-[-10%] w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            background: ['#7c3aed', '#2563eb', '#10b981', '#f59e0b'][i % 4],
            top: `${10 + i * 12}%`,
            left: `${5 + i * 11}%`,
            animation: `bounceGentle ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-8">

        {/* Logo/Icon */}
        <div
          className="relative"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Outer ring */}
          <div className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'conic-gradient(from 0deg, #7c3aed, #2563eb, #10b981, #7c3aed)',
              animation: 'spin 4s linear infinite',
              padding: '3px',
            }}>
            <div className="w-full h-full rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)' }}>
              <svg viewBox="0 0 24 24" className="w-14 h-14 text-purple-300" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" opacity="0.3"/>
                <path d="M16 11l-4-3-4 3V7l4-3 4 3v4zm0 2l-4 3-4-3 4 3 4-3z" opacity="0.8"/>
                <circle cx="12" cy="12" r="3" />
                <path d="M5 12a7 7 0 0 1 14 0" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Pulsing glow */}
          <div className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
        </div>

        {/* Main title */}
        <div
          className="text-center"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease-out',
          }}
        >
          <h1 className="font-bold text-white mb-2"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
              textShadow: '0 0 30px rgba(167, 139, 250, 0.8)',
              letterSpacing: '0.02em',
            }}>
            মাইক্রোফাইন্যান্স
          </h1>
          <h2 className="font-semibold text-purple-200"
            style={{
              fontSize: 'clamp(1.2rem, 4vw, 2rem)',
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
              textShadow: '0 0 20px rgba(167, 139, 250, 0.5)',
            }}>
            সদস্য ব্যবস্থাপনা
          </h2>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.7s ease-out 0.2s',
          }}
        >
          <p className="text-purple-300 text-center text-sm md:text-base"
            style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
            আপনার সকল সদস্যের তথ্য এক জায়গায়
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="w-64 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #2563eb, #10b981)',
              width: phase >= 3 ? '100%' : phase >= 2 ? '66%' : phase >= 1 ? '33%' : '0%',
              transition: 'width 0.8s ease-in-out',
            }}
          />
        </div>

        {/* Loading dots */}
        <div className="flex gap-2"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 0.5s ease 0.3s',
          }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
