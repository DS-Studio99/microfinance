import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md'
import { RiShieldCheckLine } from 'react-icons/ri'
import { HiSparkles } from 'react-icons/hi2'
import toast from 'react-hot-toast'

/* ── tiny floating particle ── */
const Particle = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.12)',
      animation: 'floatUp var(--dur) var(--delay) ease-in-out infinite alternate',
      ...style,
    }}
  />
)

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('ইমেইল এবং পাসওয়ার্ড প্রবেশ করুন')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে')
    } catch {
      toast.error('লগইন করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const particles = [
    { width: 80, height: 80, top: '10%', left: '8%',  '--dur': '6s',  '--delay': '0s'   },
    { width: 50, height: 50, top: '25%', left: '80%', '--dur': '8s',  '--delay': '1s'   },
    { width: 35, height: 35, top: '65%', left: '15%', '--dur': '7s',  '--delay': '2s'   },
    { width: 60, height: 60, top: '80%', left: '70%', '--dur': '9s',  '--delay': '0.5s' },
    { width: 25, height: 25, top: '45%', left: '90%', '--dur': '5s',  '--delay': '3s'   },
    { width: 45, height: 45, top: '5%',  left: '55%', '--dur': '10s', '--delay': '1.5s' },
  ]

  return (
    <>
      {/* ── global keyframes injected once ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

        @keyframes floatUp {
          from { transform: translateY(0) scale(1); opacity: 0.1; }
          to   { transform: translateY(-30px) scale(1.15); opacity: 0.25; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.6); }
          70%  { box-shadow: 0 0 0 18px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinBtn {
          to { transform: rotate(360deg); }
        }

        .login-page-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Hind Siliguri', sans-serif;
          background: #07060f;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .lp-left {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: linear-gradient(145deg, #1a0533 0%, #0d0921 40%, #0a1628 100%);
          overflow: hidden;
          animation: slideInLeft 0.7s ease-out both;
        }
        .lp-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(139,92,246,0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 75%, rgba(59,130,246,0.2) 0%, transparent 55%);
          pointer-events: none;
        }

        /* decorative ring */
        .lp-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(139,92,246,0.2);
        }
        .lp-ring-1 { width: 340px; height: 340px; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .lp-ring-2 { width: 520px; height: 520px; top: 50%; left: 50%; transform: translate(-50%,-50%); border-color: rgba(59,130,246,0.12); }
        .lp-ring-3 { width: 700px; height: 700px; top: 50%; left: 50%; transform: translate(-50%,-50%); border-color: rgba(139,92,246,0.07); }

        /* logo badge */
        .lp-logo {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 28px;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          box-shadow: 0 8px 40px rgba(139,92,246,0.5);
          animation: pulseRing 2.5s ease-out infinite;
          z-index: 1;
        }
        .lp-logo svg { width: 46px; height: 46px; color: #fff; }

        .lp-brand-title {
          font-size: 2.1rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          line-height: 1.3;
          z-index: 1;
          margin-bottom: 0.75rem;
          letter-spacing: -0.3px;
        }
        .lp-brand-sub {
          font-size: 1rem;
          color: rgba(167,139,250,0.85);
          text-align: center;
          z-index: 1;
          margin-bottom: 2.5rem;
          max-width: 280px;
          line-height: 1.7;
        }

        /* feature pills */
        .lp-features {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          z-index: 1;
          width: 100%;
          max-width: 300px;
        }
        .lp-feature-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 0.7rem 1rem;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.6s ease-out both;
        }
        .lp-feature-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }
        .lp-feature-text { font-size: 0.85rem; color: rgba(226,232,240,0.85); }

        .lp-bottom-badge {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.72rem;
          color: rgba(139,92,246,0.6);
          letter-spacing: 0.5px;
          z-index: 1;
          white-space: nowrap;
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          width: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          background: #0f0d1a;
          position: relative;
          animation: slideInRight 0.7s ease-out both;
        }
        @media (max-width: 820px) {
          .lp-left { display: none; }
          .lp-right { width: 100%; background: linear-gradient(145deg, #1a0533 0%, #0a1628 100%); }
        }

        .lp-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 2.5rem;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(139,92,246,0.1),
            0 30px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .lp-card-header {
          margin-bottom: 2.2rem;
        }
        .lp-card-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #a78bfa;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .lp-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 8px #a78bfa;
        }
        .lp-card-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 0.4rem;
        }
        .lp-card-desc {
          font-size: 0.9rem;
          color: rgba(148,163,184,0.8);
          line-height: 1.6;
        }

        /* ── form elements ── */
        .lp-field { margin-bottom: 1.3rem; }
        .lp-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(167,139,250,0.9);
          margin-bottom: 0.5rem;
          letter-spacing: 0.3px;
        }
        .lp-input-wrap {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          transition: box-shadow 0.25s;
        }
        .lp-input-wrap.focused {
          box-shadow: 0 0 0 2px rgba(139,92,246,0.6), 0 0 20px rgba(139,92,246,0.15);
        }
        .lp-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(139,92,246,0.7);
          font-size: 1.2rem;
          pointer-events: none;
          transition: color 0.2s;
        }
        .lp-input-wrap.focused .lp-input-icon { color: #a78bfa; }
        .lp-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 0.85rem 3rem 0.85rem 2.8rem;
          font-size: 0.92rem;
          font-family: 'Hind Siliguri', sans-serif;
          color: #e2e8f0;
          outline: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .lp-input::placeholder { color: rgba(100,116,139,0.7); }
        .lp-input:focus { background: rgba(255,255,255,0.08); border-color: transparent; }
        .lp-input:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(100,116,139,0.7);
          padding: 4px;
          display: flex;
          align-items: center;
          font-size: 1.15rem;
          transition: color 0.2s;
        }
        .lp-eye-btn:hover { color: #a78bfa; }

        /* submit button */
        .lp-submit {
          width: 100%;
          padding: 0.95rem;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Hind Siliguri', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 0.4rem;
          box-shadow: 0 8px 30px rgba(124,58,237,0.45);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
        }
        .lp-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          border-radius: 14px;
        }
        .lp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(124,58,237,0.6);
        }
        .lp-submit:active:not(:disabled) { transform: translateY(0); }
        .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lp-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spinBtn 0.8s linear infinite;
        }

        .lp-footer-text {
          text-align: center;
          font-size: 0.75rem;
          color: rgba(100,116,139,0.7);
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .lp-footer-text svg { color: #10b981; font-size: 0.95rem; }

        .lp-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.5rem 0;
        }
        .lp-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .lp-divider-text {
          font-size: 0.72rem;
          color: rgba(100,116,139,0.6);
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="login-page-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="lp-left">
          {particles.map((p, i) => (
            <Particle key={i} style={p} />
          ))}

          {/* decorative rings */}
          <div className="lp-ring lp-ring-1" />
          <div className="lp-ring lp-ring-2" />
          <div className="lp-ring lp-ring-3" />

          {/* logo */}
          <div className="lp-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>

          <h1 className="lp-brand-title">মাইক্রোফাইন্যান্স<br />সদস্য ব্যবস্থাপনা</h1>
          <p className="lp-brand-sub">স্মার্ট ও নিরাপদ অ্যাডমিন প্যানেল — সদস্যদের সম্পূর্ণ তথ্য পরিচালনা করুন</p>

          <div className="lp-features">
            {[
              { icon: '🏦', bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', text: 'রিয়েল-টাইম ড্যাশবোর্ড' },
              { icon: '👥', bg: 'rgba(59,130,246,0.2)',  color: '#60a5fa', text: 'VO গ্রুপ পরিচালনা' },
              { icon: '📊', bg: 'rgba(16,185,129,0.2)',  color: '#34d399', text: 'বিস্তারিত রিপোর্ট ও পরিসংখ্যান' },
            ].map((f, i) => (
              <div key={i} className="lp-feature-pill" style={{ animationDelay: `${0.4 + i * 0.15}s` }}>
                <div className="lp-feature-icon" style={{ background: f.bg }}>
                  <span>{f.icon}</span>
                </div>
                <span className="lp-feature-text">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="lp-bottom-badge">© ২০২৪ মাইক্রোফাইন্যান্স সিস্টেম</div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="lp-right">
          <div className="lp-card">

            {/* header */}
            <div className="lp-card-header">
              <div className="lp-card-eyebrow">
                <div className="lp-eyebrow-dot" />
                অ্যাডমিন একাউন্ট
              </div>
              <h2 className="lp-card-title">স্বাগতম 👋</h2>
              <p className="lp-card-desc">আপনার ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>
            </div>

            {/* form */}
            <form onSubmit={handleLogin}>
              {/* email */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="login-email">ইমেইল ঠিকানা</label>
                <div className={`lp-input-wrap ${focusedField === 'email' ? 'focused' : ''}`}>
                  <MdEmail className="lp-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="lp-input"
                    placeholder="উদাহরণ: admin@brac.net"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* password */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="login-password">পাসওয়ার্ড</label>
                <div className={`lp-input-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
                  <MdLock className="lp-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="lp-input"
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              <div className="lp-divider">
                <div className="lp-divider-line" />
                <span className="lp-divider-text">নিরাপদ সংযোগ</span>
                <div className="lp-divider-line" />
              </div>

              {/* submit */}
              <button id="login-btn" type="submit" className="lp-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="lp-spinner" />
                    লগইন হচ্ছে...
                  </>
                ) : (
                  <>
                    লগইন করুন
                    <MdArrowForward style={{ fontSize: '1.1rem' }} />
                  </>
                )}
              </button>
            </form>

            {/* footer */}
            <div className="lp-footer-text">
              <RiShieldCheckLine />
              শুধুমাত্র অনুমোদিত অ্যাডমিনের জন্য
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default LoginPage
