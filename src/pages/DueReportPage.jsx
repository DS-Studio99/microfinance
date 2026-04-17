import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useVOGroups } from '../hooks/useVOGroups'
import { getDaysOverdue, formatDate, formatMoney } from '../components/MemberCard'
import {
  MdArrowBack, MdWarning, MdGroups, MdPeople, MdAccessTime,
  MdPhone, MdAttachMoney, MdLocationOn, MdCalendarToday,
  MdExpandMore, MdExpandLess, MdRefresh, MdChevronRight
} from 'react-icons/md'

// ── Overdue badge color ─────────────────────────────────
const getOverdueSeverity = (days) => {
  if (!days) return null
  if (days >= 15) return { bg: '#7f1d1d', border: '#991b1b', text: '#fff', label: 'জরুরি' }
  if (days >= 10) return { bg: '#dc2626', border: '#ef4444', text: '#fff', label: 'গুরুতর' }
  if (days >= 5) return { bg: '#ea580c', border: '#f97316', text: '#fff', label: 'মনোযোগ দিন' }
  return { bg: '#d97706', border: '#f59e0b', text: '#fff', label: 'সামান্য' }
}

// ── Single due member row ───────────────────────────────
const DueMemberRow = ({ member }) => {
  const days = getDaysOverdue(member.loan_payment_date)
  const sev = getOverdueSeverity(days)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 8,
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #f8fafc',
      background: days >= 30 ? '#fff9f9' : '#fff',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {member.full_name}
          </span>
          {member.is_called && (
            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '1px 6px', fontFamily: "'Hind Siliguri', sans-serif" }}>
              কল হয়েছে
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3, flexWrap: 'wrap' }}>
          {member.phone_number && (
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MdPhone style={{ fontSize: 12 }} />{member.phone_number}
            </span>
          )}
          <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdCalendarToday style={{ fontSize: 12 }} />{formatDate(member.loan_payment_date)}
          </span>
          {member.loan_amount && (
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>
              <MdAttachMoney style={{ fontSize: 12 }} />{formatMoney(member.loan_amount)}
            </span>
          )}
        </div>
      </div>
      {/* Days overdue badge */}
      {days && sev && (
        <div style={{
          background: sev.bg, color: sev.text,
          borderRadius: 10, padding: '5px 10px',
          textAlign: 'center', flexShrink: 0,
          minWidth: 64,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: 9, fontWeight: 600, marginTop: 1, fontFamily: "'Hind Siliguri', sans-serif", opacity: 0.9 }}>দিন পূর্বে</div>
        </div>
      )}
    </div>
  )
}

// ── VO accordion card ───────────────────────────────────
const VODueCard = ({ vo, members, idx, navigateToVO }) => {
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(() =>
    [...members].sort((a, b) => {
      const da = getDaysOverdue(a.loan_payment_date) || 0
      const db = getDaysOverdue(b.loan_payment_date) || 0
      return db - da  // most overdue first
    }),
    [members]
  )

  const maxDays = sorted.length > 0 ? (getDaysOverdue(sorted[0].loan_payment_date) || 0) : 0
  const sev = getOverdueSeverity(maxDays)

  const gradients = [
    ['#4f46e5', '#7c3aed'],
    ['#0891b2', '#0e7490'],
    ['#059669', '#047857'],
    ['#d97706', '#b45309'],
    ['#dc2626', '#b91c1c'],
    ['#7c3aed', '#6d28d9'],
  ]
  const [g1, g2] = gradients[idx % gradients.length]

  return (
    <div style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      border: '1px solid #e8edf3',
      boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
      animation: `slideUp 0.35s ease-out ${idx * 0.06}s both`,
    }}>
      {/* VO Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '1rem 1.1rem',
        background: `linear-gradient(135deg,${g1},${g2})`,
        cursor: 'pointer',
        position: 'relative',
      }} onClick={() => setExpanded(e => !e)}>
        {/* VO icon */}
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MdGroups style={{ color: '#fff', fontSize: 22 }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.2 }}>
            ভিও নং- {String(vo.vo_number).padStart(2, '0')}
          </p>
          {vo.vo_name && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>{vo.vo_name}</p>
          )}
        </div>

        {/* Member count + max overdue */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <MdWarning style={{ color: '#fff', fontSize: 13 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{members.length} জন</span>
          </div>
          {maxDays > 0 && sev && (
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
              max {maxDays} দিন
            </div>
          )}
        </div>

        {/* Expand icon */}
        <div style={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0, transition: 'transform 0.25s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <MdExpandMore style={{ fontSize: 22 }} />
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', borderBottom: expanded ? '1px solid #f1f5f9' : 'none' }}>
        <button
          onClick={() => navigateToVO(vo.vo_number)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0.65rem', border: 'none',
            background: '#fafafa', color: '#4338ca',
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Hind Siliguri', sans-serif",
            cursor: 'pointer', transition: 'background 0.15s',
            borderBottom: '1px solid #f1f5f9',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#fafafa'}
        >
          <MdChevronRight style={{ fontSize: 17 }} />
          এই ভিও-তে যান
        </button>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '0.65rem 1rem', border: 'none', borderLeft: '1px solid #f1f5f9',
            background: '#fafafa', color: '#64748b',
            fontSize: 12, fontWeight: 600,
            fontFamily: "'Hind Siliguri', sans-serif",
            cursor: 'pointer', transition: 'background 0.15s',
            borderBottom: '1px solid #f1f5f9',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fafafa'}
        >
          {expanded ? <><MdExpandLess style={{ fontSize: 16 }} />লুকান</> : <><MdExpandMore style={{ fontSize: 16 }} />দেখুন</>}
        </button>
      </div>

      {/* Member list (expanded) */}
      {expanded && (
        <div>
          {sorted.map(m => <DueMemberRow key={m.id} member={m} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────
const DueReportPage = () => {
  const navigate = useNavigate()
  const { voGroups } = useVOGroups()
  const [dueMembers, setDueMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDueMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_due', true)
        .order('loan_payment_date', { ascending: true })

      if (error) throw error
      setDueMembers(data || [])
    } catch (err) {
      console.error('Due members fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDueMembers() }, [fetchDueMembers])

  // Group by VO number
  const byVO = useMemo(() => {
    const map = {}
    dueMembers.forEach(m => {
      if (!map[m.vo_number]) map[m.vo_number] = []
      map[m.vo_number].push(m)
    })
    // Sort VOs by count descending
    return Object.entries(map)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([voNum, members]) => ({
        voNum: parseInt(voNum),
        members,
        vo: voGroups.find(v => v.vo_number === parseInt(voNum)),
      }))
  }, [dueMembers, voGroups])

  // Overall stats
  const totalDays = useMemo(() => {
    const days = dueMembers
      .map(m => getDaysOverdue(m.loan_payment_date))
      .filter(Boolean)
    if (days.length === 0) return 0
    return Math.max(...days)
  }, [dueMembers])

  const criticalCount = useMemo(() =>
    dueMembers.filter(m => (getDaysOverdue(m.loan_payment_date) || 0) >= 30).length,
    [dueMembers]
  )

  return (
    <>
      <style>{`
        .due-vo-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
      `}</style>

      <div className="page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <MdArrowBack style={{ fontSize: 20, color: '#475569' }} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
              বকেয়া সদস্য রিপোর্ট
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
              ভিও-ভিত্তিক বকেয়া বিশ্লেষণ
            </p>
          </div>
          <button
            id="refresh-due-btn"
            onClick={fetchDueMembers}
            disabled={loading}
            className="btn-ghost"
            style={{ padding: '0.6rem 0.9rem' }}
          >
            <MdRefresh className={loading ? 'spinner' : ''} style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Summary Cards */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
            {[
              {
                icon: MdPeople, label: 'মোট বকেয়া',
                value: dueMembers.length,
                g1: '#dc2626', g2: '#b91c1c',
              },
              {
                icon: MdWarning, label: '15+ দিন বকেয়া',
                value: criticalCount,
                g1: '#7f1d1d', g2: '#991b1b',
              },
              {
                icon: MdGroups, label: 'আক্রান্ত ভিও',
                value: byVO.length,
                g1: '#4f46e5', g2: '#7c3aed',
              },
            ].map(({ icon: IC, label, value, g1, g2 }) => (
              <div key={label} style={{
                background: `linear-gradient(135deg,${g1},${g2})`,
                borderRadius: 16, padding: '0.9rem',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${g1}30`,
              }}>
                <IC style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, marginBottom: 4 }} />
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="due-vo-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && dueMembers.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MdPeople style={{ fontSize: 38, color: '#22c55e' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#14532d', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 8 }}>
              কোনো বকেয়া সদস্য নেই! 🎉
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
              সব সদস্যের ঋণ পরিশোধ করা আছে।
            </p>
          </div>
        )}

        {/* VO Accordion Cards */}
        {!loading && byVO.length > 0 && (
          <>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MdGroups style={{ color: '#4f46e5', fontSize: 18 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: "'Hind Siliguri', sans-serif" }}>
                ভিও-ভিত্তিক তালিকা
              </p>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <div className="due-vo-grid">
              {byVO.map(({ voNum, members, vo }, idx) => (
                <VODueCard
                  key={voNum}
                  vo={vo || { vo_number: voNum, vo_name: null }}
                  members={members}
                  idx={idx}
                  navigateToVO={(n) => navigate(`/vo/${n}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default DueReportPage
