import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useVOGroups } from '../hooks/useVOGroups'
import { formatDate, formatMoney } from '../components/MemberCard'
import {
  MdArrowBack, MdGroups, MdPeople,
  MdPhone, MdAttachMoney, MdCalendarToday,
  MdExpandMore, MdExpandLess, MdRefresh, MdChevronRight, MdSearch,
  MdSchedule, MdCheckCircle
} from 'react-icons/md'

// Helper: parse disbursement date string robustly
const parseDisbursementDate = (dateStr) => {
  if (!dateStr) return null
  const clean = String(dateStr).split('T')[0].split(' ')[0].trim()
  let y, m, d
  if (clean.includes('-')) {
    const p = clean.split('-')
    if (p.length === 3) {
      if (p[0].length === 4) { y = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10) }
      else if (p[2].length === 4) { y = parseInt(p[2], 10); m = parseInt(p[1], 10); d = parseInt(p[0], 10) }
    }
  } else if (clean.includes('/')) {
    const p = clean.split('/')
    if (p.length === 3) {
      if (p[0].length === 4) { y = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10) }
      else if (p[2].length === 4) { y = parseInt(p[2], 10); m = parseInt(p[1], 10); d = parseInt(p[0], 10) }
    }
  }
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) {
    const dt = new Date(dateStr)
    return isNaN(dt.getTime()) ? null : dt
  }
  const dtObj = new Date(y, m - 1, d)
  return isNaN(dtObj.getTime()) ? null : dtObj
}

// Helper: add months to date
const addMonthsToDate = (baseDate, monthsToAdd) => {
  const d = new Date(baseDate.getTime())
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + monthsToAdd)
  const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, maxDays))
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const dateNum = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${dateNum}`
}

// ── Single Member Row ───────────────────────────────────
const LastKistiMemberRow = ({ member }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 8,
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #f1f5f9',
      background: '#fff',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {member.full_name}
          </span>
          {member.member_number && (
            <span style={{ background: '#0f172a', color: '#e2e8f0', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
              #{member.member_number}
            </span>
          )}
          {member.father_name && (
            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>
              ({member.father_name})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap', fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
          {member.phone_number && (
            <a href={`tel:${member.phone_number}`} style={{ color: '#ec4899', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
              <MdPhone style={{ fontSize: 12 }} />{member.phone_number}
            </a>
          )}
          {member.loan_disbursement_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MdCalendarToday style={{ fontSize: 12, color: '#16a34a' }} />
              বিতরণ: {formatDate(member.loan_disbursement_date)}
            </span>
          )}
          {member.loan_amount && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MdAttachMoney style={{ fontSize: 12, color: '#059669' }} />
              {formatMoney(member.loan_amount)}
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ background: '#fce7f3', color: '#be185d', padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", display: 'inline-block' }}>
          শেষ (১২তম) কিস্তি: {formatDate(member.lastKistiDate)}
        </span>
      </div>
    </div>
  )
}

// ── VO Accordion Card ───────────────────────────────────
const VOLastKistiCard = ({ vo, members, idx, navigateToVO }) => {
  const [expanded, setExpanded] = useState(false)

  const gradients = [
    ['#ec4899', '#be185d'],
    ['#d97706', '#b45309'],
    ['#059669', '#047857'],
    ['#4f46e5', '#3730a3'],
    ['#8b5cf6', '#6d28d9'],
  ]
  const [g1, g2] = gradients[idx % gradients.length]

  return (
    <div style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      border: '1px solid #e8edf3',
      boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
      animation: `slideUp 0.35s ease-out ${idx * 0.05}s both`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '1rem 1.1rem',
        background: `linear-gradient(135deg,${g1},${g2})`,
        cursor: 'pointer',
      }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MdGroups style={{ color: '#fff', fontSize: 22 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.2 }}>
            ভিও নং- {String(vo?.vo_number || members[0]?.vo_number).padStart(2, '0')}
          </p>
          {vo?.vo_name && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: "'Hind Siliguri', sans-serif" }}>{vo.vo_name}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {members.length} জন
          </div>
          <div style={{ color: '#fff', transition: 'transform 0.25s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <MdExpandMore style={{ fontSize: 22 }} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', borderBottom: expanded ? '1px solid #f1f5f9' : 'none' }}>
        <button
          onClick={() => navigateToVO(vo?.vo_number || members[0]?.vo_number)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0.65rem', border: 'none', background: '#fafafa', color: '#be185d',
            fontSize: 13, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif",
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fdf2f8'}
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
            background: '#fafafa', color: '#64748b', fontSize: 12, fontWeight: 600,
            fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer',
          }}
        >
          {expanded ? <><MdExpandLess style={{ fontSize: 16 }} />লুকান</> : <><MdExpandMore style={{ fontSize: 16 }} />দেখুন</>}
        </button>
      </div>

      {/* Member list */}
      {expanded && (
        <div>
          {members.map(m => <LastKistiMemberRow key={m.id} member={m} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────
const LastKistiPage = () => {
  const navigate = useNavigate()
  const { voGroups, disabledVoNumbers } = useVOGroups()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')

      if (error) throw error

      const today = new Date()
      const currentYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

      const list = []
      ;(data || []).forEach(m => {
        if (!m.loan_disbursement_date) return
        // Skip if loan fully cleared
        if (m.loan_cleared_date) return

        const d = parseDisbursementDate(m.loan_disbursement_date)
        if (!d) return
        const disbDateStr = m.loan_disbursement_date

        // 12th kisti date = disbursement date + 12 months
        const lastKistiDate = addMonthsToDate(d, 12)
        if (lastKistiDate.startsWith(currentYM)) {
          // Check if paid this month
          const paidThisMonth = m.last_paid_date && m.last_paid_date.startsWith(currentYM)
          if (!paidThisMonth) {
            list.push({ ...m, loan_disbursement_date: disbDateStr, lastKistiDate })
          }
        }
      })

      setMembers(list)
    } catch (err) {
      console.error('Last kisti fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase()
    const disabledSet = new Set((disabledVoNumbers || []).map(Number))
    const active = members.filter(m => !disabledSet.has(Number(m.vo_number)))
    return active.filter(m =>
      (m.full_name && m.full_name.toLowerCase().includes(q)) ||
      (m.member_number && String(m.member_number).toLowerCase().includes(q)) ||
      (m.phone_number && m.phone_number.includes(q)) ||
      String(m.vo_number).includes(q)
    )
  }, [members, search, disabledVoNumbers])

  const byVO = useMemo(() => {
    const map = {}
    filteredMembers.forEach(m => {
      if (!map[m.vo_number]) map[m.vo_number] = []
      map[m.vo_number].push(m)
    })
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([voNum, mems]) => ({
        voNum: parseInt(voNum),
        members: mems,
        vo: voGroups.find(v => v.vo_number === parseInt(voNum)),
      }))
  }, [filteredMembers, voGroups])

  return (
    <div className="page-enter" style={{ paddingBottom: '3rem' }}>
      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.2rem', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost"
            style={{ padding: '0.5rem', borderRadius: 12 }}
            title="ড্যাশবোর্ডে ফিরুন"
          >
            <MdArrowBack style={{ fontSize: 20 }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
                শেষ কিস্তি তালিকা
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 9px',
                borderRadius: 20, fontFamily: "'Hind Siliguri', sans-serif",
              }}>
                ১২তম মাস
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
              ঋণ দেওয়ার ১২তম মাসে যাদের শেষ কিস্তি পড়েছে (এই মাসের তালিকায়)
            </p>
          </div>
        </div>

        <button
          onClick={fetchMembers}
          disabled={loading}
          className="btn-ghost"
          style={{ padding: '0.5rem 0.9rem', fontSize: 13 }}
        >
          <MdRefresh className={loading ? 'spinner' : ''} style={{ fontSize: 16 }} />
          রিফ্রেশ
        </button>
      </div>

      {/* ── Summary Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899, #be185d)',
        borderRadius: 18, padding: '1.2rem 1.4rem', color: '#fff',
        marginBottom: '1.2rem', boxShadow: '0 6px 24px rgba(236, 72, 153, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.9, fontFamily: "'Hind Siliguri', sans-serif" }}>
            এই মাসে শেষ (১২তম) কিস্তি বিশিষ্ট মোট সদস্য
          </p>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>
            {loading ? '...' : `${filteredMembers.length} জন`}
          </div>
          <p style={{ fontSize: 11, opacity: 0.85, fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>
            মোট {byVO.length} টি ভিও গ্রুপে ছড়িয়ে আছে
          </p>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MdSchedule style={{ fontSize: 26, color: '#fff' }} />
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
        <MdSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="নাম, সদস্য নং, মোবাইল বা ভিও নং দিয়ে খুঁজুন..."
          className="input-field"
          style={{ paddingLeft: 40, fontFamily: "'Hind Siliguri', sans-serif" }}
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 1rem', borderColor: '#ec4899', borderTopColor: 'transparent' }} />
          <p style={{ color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>শেষ কিস্তির তথ্য লোড হচ্ছে...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 18, padding: '3rem 1.5rem',
          textAlign: 'center', border: '1px solid #e8edf3',
        }}>
          <MdCheckCircle style={{ fontSize: 48, color: '#ec4899', marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {search ? 'কোনো সদস্য খুঁজে পাওয়া যায়নি' : 'এই মাসে কোনো শেষ কিস্তি নেই'}
          </h3>
          <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>
            {search ? 'অন্য সার্চ টার্ম চেষ্টা করুন' : 'চলতি মাসে ঋণ নেওয়ার ১২তম মাস শেষ হওয়া কোনো বকেয়া কিস্তি নেই'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {byVO.map(({ vo, members: voMems, voNum }, idx) => (
            <VOLastKistiCard
              key={voNum}
              vo={vo}
              members={voMems}
              idx={idx}
              navigateToVO={num => navigate(`/vo/${num}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LastKistiPage
