import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useVOGroups'
import { useAuthStore } from '../store/authStore'
import {
  MdPeople, MdGroups, MdToday, MdWarning, MdEvent,
  MdArrowForward, MdRefresh, MdDashboard, MdPendingActions,
  MdCheckCircle, MdAccessTime, MdAttachMoney, MdAddCard, MdBook, MdEditNote,
} from 'react-icons/md'
import { RiShieldCheckLine } from 'react-icons/ri'
import { HiSparkles } from 'react-icons/hi2'
import CashCalculator from '../components/CashCalculator'

/* ── Animated number counter ── */
const Counter = ({ target, loading }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (loading) { setCount(0); return }
    let cur = 0
    const step = Math.max(1, Math.ceil(target / 28))
    const id = setInterval(() => {
      cur += step
      if (cur >= target) { setCount(target); clearInterval(id) }
      else setCount(cur)
    }, 28)
    return () => clearInterval(id)
  }, [target, loading])

  if (loading) return <div className="skeleton" style={{ width: 64, height: 36 }} />
  return <>{count}</>
}

/* ── Stat card ── */
const StatCard = ({ title, value, subInfo, icon: Icon, g1, g2, glow, badge, onClick, loading, delay }) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    style={{
      background: `linear-gradient(135deg,${g1},${g2})`,
      borderRadius: 18, padding: '1.1rem 1.2rem',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 6px 24px ${glow}40`,
      animation: `slideUp 0.45s ease-out ${delay}s both`,
      transition: 'transform 0.22s, box-shadow 0.22s',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 14px 36px ${glow}55` } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${glow}40` }}
  >
    <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ color: '#fff', fontSize: 20 }} />
        </div>
        {badge && (
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 700, color: '#fff' }}>{badge}</span>
        )}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 5, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <Counter target={value} loading={loading} />
        {subInfo && <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'Hind Siliguri', sans-serif" }}>{subInfo}</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', fontFamily: "'Hind Siliguri', sans-serif" }}>{title}</p>
        {onClick && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>
            দেখুন <MdArrowForward style={{ fontSize: 13 }} />
          </div>
        )}
      </div>
    </div>
  </div>
)

/* ── Money stat card (shows ৳ prefix) ── */
const MoneyCard = ({ title, value, icon: Icon, g1, g2, glow, badge, onClick, loading, delay }) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    style={{
      background: `linear-gradient(135deg,${g1},${g2})`,
      borderRadius: 18, padding: '1.1rem 1.2rem',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 6px 24px ${glow}40`,
      animation: `slideUp 0.45s ease-out ${delay}s both`,
      transition: 'transform 0.22s, box-shadow 0.22s',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 14px 36px ${glow}55` } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${glow}40` }}
  >
    <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ color: '#fff', fontSize: 20 }} />
        </div>
        {badge && (
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 700, color: '#fff' }}>{badge}</span>
        )}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 5 }}>
        {loading ? <div className="skeleton" style={{ width: 80, height: 22 }} /> : <>৳ {value.toLocaleString('bn-BD')}</>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', fontFamily: "'Hind Siliguri', sans-serif" }}>{title}</p>
        {onClick && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>
            দেখুন <MdArrowForward style={{ fontSize: 13 }} />
          </div>
        )}
      </div>
    </div>
  </div>
)

/* ── Quick nav card ── */
const QuickCard = ({ icon: Icon, title, subtitle, count, color, onClick, loading, delay }) => (
  <div
    onClick={onClick}
    role="button"
    style={{
      background: '#fff', borderRadius: 16, padding: '1rem',
      border: '1px solid #e8edf3', cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: `slideUp 0.45s ease-out ${delay}s both`,
      transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = '#c7d2fe' }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,0.06)'; e.currentTarget.style.borderColor = '#e8edf3' }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ fontSize: 22, color }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>{title}</p>
      <p style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>{subtitle}</p>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>
        {loading ? '...' : count}
      </div>
      <MdArrowForward style={{ color: '#cbd5e1', fontSize: 15, marginTop: 3 }} />
    </div>
  </div>
)

const DashboardPage = () => {
  const navigate = useNavigate()
  const { stats, loading, fetchStats } = useDashboardStats()
  const { user } = useAuthStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ বিকেল' : 'শুভ সন্ধ্যা'
  const today = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const statCards = [
    { title: 'মোট সদস্য সংখ্যা', value: stats.totalMembers, icon: MdPeople, g1: '#2563eb', g2: '#1d4ed8', glow: '#2563eb', badge: 'সদস্য', onClick: () => navigate('/members'), delay: 0 },
    { title: 'মোট ভিও সংখ্যা', value: stats.totalVOs, icon: MdGroups, g1: '#059669', g2: '#047857', glow: '#059669', badge: 'গ্রুপ', onClick: () => navigate('/vo-list'), delay: 0.05 },
    { title: 'আজকের কিস্তি', value: stats.todayPayments, subInfo: `(নিশ্চিত: ${stats.todayConfirmed})`, icon: MdToday, g1: '#d97706', g2: '#b45309', glow: '#d97706', badge: 'আজ', onClick: () => navigate('/today-kisti'), delay: 0.1 },
    { title: 'আগামীকালের কিস্তি', value: stats.tomorrowPayments, subInfo: `(নিশ্চিত: ${stats.tomorrowConfirmed})`, icon: MdEvent, g1: '#84cc16', g2: '#4d7c0f', glow: '#84cc16', badge: 'আগামীকাল', onClick: () => navigate('/tomorrow-kisti'), delay: 0.15 },
    { title: 'মোট বকেয়া সদস্য', value: stats.dueMembers, icon: MdWarning, g1: '#dc2626', g2: '#b91c1c', glow: '#dc2626', badge: 'বকেয়া', onClick: () => navigate('/due-report'), delay: 0.2 },
    { title: 'পেন্ডিং কালেকশন', value: stats.pendingCollections, icon: MdPendingActions, g1: '#8b5cf6', g2: '#6d28d9', glow: '#8b5cf6', badge: 'পোস্টিং বাকি', onClick: () => navigate('/collections'), delay: 0.25 },
  ]

  const moneyCard = { title: 'টোটাল বাকি পাওনা', value: stats.totalDueAmount, icon: MdAttachMoney, g1: '#be123c', g2: '#9f1239', glow: '#be123c', badge: 'পাওনা', onClick: () => navigate('/total-due-amount'), delay: 0.3 }
  const actionCards = [
    { title: 'নতুন লোন আবেদন', value: stats.totalLoanApplications, icon: MdAddCard, g1: '#0284c7', g2: '#0369a1', glow: '#0284c7', badge: 'লোন', onClick: () => navigate('/new-loan'), delay: 0.35 },
    { title: 'বই সংগ্রহ', value: stats.totalBooks, icon: MdBook, g1: '#0891b2', g2: '#0e7490', glow: '#0891b2', badge: 'বই', onClick: () => navigate('/book-collection'), delay: 0.4 },
    { title: 'জরুরী নোট', value: 'নোট', icon: MdEditNote, g1: '#f59e0b', g2: '#d97706', glow: '#f59e0b', badge: 'নোট', onClick: () => navigate('/notes'), delay: 0.45 },
  ]

  return (
    <>
      <style>{`
        .db-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 768px) { .db-stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px) { .db-stats-grid { grid-template-columns: repeat(6, 1fr); } }
        .db-action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 600px) { .db-action-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
        .db-bottom-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.1rem;
        }
        @media (min-width: 720px) { .db-bottom-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1100px) { .db-bottom-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      <div className="page-enter">
        {/* ── Welcome Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          borderRadius: 20, padding: '1.25rem 1.4rem',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 28px rgba(79,70,229,0.3)',
          position: 'relative', overflow: 'hidden',
          animation: 'slideUp 0.4s ease-out both',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: '35%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <HiSparkles style={{ color: '#fde68a', fontSize: 16 }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>{greeting}!</span>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 4 }}>
                ড্যাশবোর্ড ওভারভিউ
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: "'Hind Siliguri', sans-serif" }}>{today}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { icon: <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />, label: 'সিস্টেম সক্রিয়' },
                { icon: <RiShieldCheckLine style={{ color: '#86efac', fontSize: 13 }} />, label: 'নিরাপদ সংযোগ' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}>
                  {icon}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontFamily: "'Hind Siliguri', sans-serif" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdDashboard style={{ color: '#fff', fontSize: 17 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1 }}>পরিসংখ্যান সারাংশ</h2>
              <p style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>রিয়েল-টাইম তথ্য</p>
            </div>
          </div>
          <button
            id="refresh-stats-btn"
            onClick={fetchStats}
            disabled={loading}
            className="btn-ghost"
            style={{ padding: '0.55rem 0.9rem', fontSize: 13 }}
          >
            <MdRefresh className={loading ? 'spinner' : ''} style={{ fontSize: 17 }} />
            রিফ্রেশ
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="db-stats-grid">
          {statCards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
        </div>

        {/* ── New Feature Cards ── */}
        <div style={{ marginBottom: '0.6rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
            ✨ নতুন ফিচার
          </p>
        </div>
        <div className="db-action-grid">
          <MoneyCard {...moneyCard} loading={loading} />
          {actionCards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
        </div>

        {/* ── Bottom grid ── */}
        <div className="db-bottom-grid">
          {/* Quick nav */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: "'Hind Siliguri', sans-serif" }}>দ্রুত নেভিগেশন</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuickCard icon={MdPeople} title="সকল সদস্য" subtitle="সব ভিও-র সম্পূর্ণ সদস্য তালিকা" count={stats.totalMembers} color="#4f46e5" onClick={() => navigate('/members')} loading={loading} delay={0.3} />
              <QuickCard icon={MdGroups} title="ভিও তালিকা" subtitle="সকল ভিও গ্রুপ ও সদস্য" count={stats.totalVOs} color="#059669" onClick={() => navigate('/vo-list')} loading={loading} delay={0.36} />
            </div>
          </div>

          {/* Alerts + Status */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: "'Hind Siliguri', sans-serif" }}>সতর্কতা ও অবস্থা</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Summary micro table */}
              <div className="surface" style={{ padding: '0.9rem 1rem', animation: 'slideUp 0.45s ease-out 0.32s both' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, letterSpacing: 0.5 }}>সিস্টেম স্ট্যাটাস</p>
                {[
                  { l: 'মোট সদস্য', v: stats.totalMembers, c: '#4f46e5', I: MdPeople },
                  { l: 'সক্রিয় ভিও', v: stats.totalVOs, c: '#059669', I: MdGroups },
                  { l: 'আজকের কিস্তি', v: stats.todayPayments, c: '#d97706', I: MdToday },
                  { l: 'আগামীকালের কিস্তি', v: stats.tomorrowPayments, c: '#65a30d', I: MdEvent },
                  { l: 'বকেয়া সদস্য', v: stats.dueMembers, c: '#dc2626', I: MdWarning },
                ].map(({ l, v, c, I }) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.42rem 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <I style={{ fontSize: 14, color: c }} />
                      <span style={{ fontSize: 12.5, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif" }}>{l}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: c }}>{loading ? '...' : v}</span>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              {!loading && stats.todayPayments > 0 && (
                <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', borderRadius: 14, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.45s ease-out 0.42s both' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MdToday style={{ color: '#fff', fontSize: 19 }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#92400e', fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>আজ {stats.todayPayments} জন সদস্যের কিস্তির তারিখ</p>
                    <p style={{ color: '#b45309', fontSize: 11.5, fontFamily: "'Hind Siliguri', sans-serif" }}>সদস্যদের সাথে যোগাযোগ করুন</p>
                  </div>
                </div>
              )}
              {!loading && stats.dueMembers > 0 && (
                <div style={{ background: 'linear-gradient(135deg,#fff5f5,#fee2e2)', border: '1.5px solid #fecaca', borderRadius: 14, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.45s ease-out 0.5s both' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MdWarning style={{ color: '#fff', fontSize: 19 }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>{stats.dueMembers} জন সদস্যের বকেয়া রয়েছে</p>
                    <p style={{ color: '#b91c1c', fontSize: 11.5, fontFamily: "'Hind Siliguri', sans-serif" }}>দ্রুত ব্যবস্থা নিন</p>
                  </div>
                </div>
              )}
              {!loading && stats.dueMembers === 0 && stats.todayPayments === 0 && (
                <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.45s ease-out 0.42s both' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MdCheckCircle style={{ color: '#fff', fontSize: 20 }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#14532d', fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>সব কিছু ঠিকঠাক আছে</p>
                    <p style={{ color: '#15803d', fontSize: 11.5, fontFamily: "'Hind Siliguri', sans-serif" }}>কোনো বকেয়া বা কিস্তি নেই</p>
                  </div>
                </div>
              )}
              {loading && (
                <div className="surface" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MdAccessTime style={{ color: '#94a3b8', fontSize: 20 }} />
                  <span style={{ color: '#94a3b8', fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>তথ্য লোড হচ্ছে...</span>
                </div>
              )}
            </div>
          </div>

          {/* Cash Calculator */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: "'Hind Siliguri', sans-serif" }}>টাকা ক্যালকুলেটর</p>
            <CashCalculator />
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <RiShieldCheckLine style={{ color: '#10b981', fontSize: 14 }} />
          মাইক্রোফাইন্যান্স সদস্য ব্যবস্থাপনা সিস্টেম — সকল তথ্য সুরক্ষিত
        </div>
      </div>
    </>
  )
}

export default DashboardPage
