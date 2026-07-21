import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  MdArrowBack, MdWarning, MdGroups, MdPeople,
  MdPhone, MdSchedule, MdChevronRight, MdRefresh,
  MdExpandMore, MdExpandLess, MdAttachMoney
} from 'react-icons/md'

// ── Single late payer row ───────────────────────────────
const LatePayerRow = ({ member }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 8,
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #f8fafc',
      background: '#fff',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {member.full_name}
          </span>
          <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '1px 6px', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 2 }}>
            <MdSchedule style={{ fontSize: 11 }} /> লেটকারী
          </span>
          {member.is_due && (
            <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '1px 6px', fontFamily: "'Hind Siliguri', sans-serif" }}>
              বকেয়া আছে
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
          {member.phone_number && (
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MdPhone style={{ fontSize: 12 }} />{member.phone_number}
            </span>
          )}
          {member.village && (
            <span style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {member.village}
            </span>
          )}
          {member.loan_amount && (
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>
              <MdAttachMoney style={{ fontSize: 12 }} />{member.loan_amount.toLocaleString('bn-BD')}
            </span>
          )}
        </div>
      </div>
      {/* Due Amount if any */}
      {(member.extra_amount && member.extra_amount > 0) ? (
        <div style={{
          background: '#7f1d1d', color: '#fff',
          borderRadius: 10, padding: '5px 10px',
          textAlign: 'center', flexShrink: 0,
          minWidth: 64,
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>৳ {member.extra_amount.toLocaleString('bn-BD')}</div>
          <div style={{ fontSize: 9, fontWeight: 600, marginTop: 1, fontFamily: "'Hind Siliguri', sans-serif", opacity: 0.9 }}>বকেয়া পাওনা</div>
        </div>
      ) : (
        <div style={{ background: '#f1f5f9', color: '#94a3b8', borderRadius: 10, padding: '5px 10px', textAlign: 'center', flexShrink: 0, minWidth: 64 }}>
           <MdSchedule style={{ fontSize: 20 }} />
        </div>
      )}
    </div>
  )
}

// ── VO accordion card ───────────────────────────────────
const VOLatePayerCard = ({ vo, members, idx, navigateToVO }) => {
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(() =>
    [...members].sort((a, b) => (b.extra_amount || 0) - (a.extra_amount || 0)),
    [members]
  )

  const totalDue = sorted.reduce((sum, m) => sum + (m.extra_amount || 0), 0)

  const gradients = [
    ['#b91c1c', '#7f1d1d'],
    ['#c2410c', '#9a3412'],
    ['#9f1239', '#881337'],
    ['#ea580c', '#c2410c'],
    ['#b45309', '#92400e'],
    ['#dc2626', '#b91c1c'],
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

        {/* Member count + total due */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <MdSchedule style={{ color: '#fff', fontSize: 13 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{members.length} জন</span>
          </div>
          {totalDue > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
              বকেয়া: ৳ {totalDue.toLocaleString('bn-BD')}
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
            background: '#fafafa', color: '#b91c1c',
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Hind Siliguri', sans-serif",
            cursor: 'pointer', transition: 'background 0.15s',
            borderBottom: '1px solid #f1f5f9',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
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
          {sorted.map(m => <LatePayerRow key={m.id} member={m} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────
const LatePayersPage = () => {
  const navigate = useNavigate()
  const [voGroups, setVoGroups] = useState([])
  const [lateMembers, setLateMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const [membersRes, voRes] = await Promise.all([
        supabase
          .from('members')
          .select('id, full_name, vo_number, phone_number, village, loan_amount, extra_amount, is_due')
          .eq('is_late_payer', true)
          .order('vo_number', { ascending: true }),
        supabase
          .from('vo_groups')
          .select('*')
      ])

      if (membersRes.error) throw membersRes.error
      if (voRes.error) throw voRes.error
      
      setLateMembers(membersRes.data || [])
      setVoGroups(voRes.data || [])
    } catch (err) {
      console.error('Late members fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  // Group by VO number
  const byVO = useMemo(() => {
    const disabledNums = voGroups.filter(v => v.is_disabled).map(v => v.vo_number)
    const activeMembers = lateMembers.filter(m => !disabledNums.includes(m.vo_number))
    const map = {}
    activeMembers.forEach(m => {
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
  }, [lateMembers, voGroups])

  return (
    <>
      <style>{`
        .late-vo-grid {
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
              নিয়মিত লেটকারী সদস্য
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
              যে সকল সদস্য নিয়মিত কিস্তি দিতে বিলম্ব করেন তাদের ভিও-ভিত্তিক তালিকা
            </p>
          </div>
          <button
            id="refresh-late-btn"
            onClick={fetchMembers}
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
                icon: MdPeople, label: 'মোট লেটকারী',
                value: lateMembers.length,
                g1: '#dc2626', g2: '#991b1b',
              },
              {
                icon: MdWarning, label: 'বকেয়া লেটকারী',
                value: lateMembers.filter(m => m.is_due || (m.extra_amount && m.extra_amount > 0)).length,
                g1: '#c2410c', g2: '#9a3412',
              },
              {
                icon: MdGroups, label: 'মোট ভিও',
                value: byVO.length,
                g1: '#be123c', g2: '#881337',
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
          <div className="late-vo-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && lateMembers.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#fef2f2,#fecaca)', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MdSchedule style={{ fontSize: 38, color: '#dc2626' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#7f1d1d', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 8 }}>
              কোনো লেটকারী সদস্য নেই! 🎉
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
              সিস্টেমে কোনো নিয়মিত লেটকারী সদস্য যুক্ত নেই।
            </p>
          </div>
        )}

        {/* VO Accordion Cards */}
        {!loading && byVO.length > 0 && (
          <>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MdGroups style={{ color: '#dc2626', fontSize: 18 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: "'Hind Siliguri', sans-serif" }}>
                ভিও-ভিত্তিক লেটকারী তালিকা
              </p>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <div className="late-vo-grid">
              {byVO.map(({ voNum, members, vo }, idx) => (
                <VOLatePayerCard
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

export default LatePayersPage
