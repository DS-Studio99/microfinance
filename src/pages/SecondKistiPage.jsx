import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useVOGroups } from '../hooks/useVOGroups'
import { formatDate, formatMoney } from '../components/MemberCard'
import {
  MdArrowBack, MdGroups, MdPeople,
  MdPhone, MdAttachMoney, MdCalendarToday,
  MdExpandMore, MdExpandLess, MdRefresh, MdChevronRight, MdSearch, MdEventAvailable
} from 'react-icons/md'

// Add months helper
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
const SecondKistiMemberRow = ({ member }) => {
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
            <a href={`tel:${member.phone_number}`} style={{ color: '#4f46e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
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
        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", display: 'inline-block' }}>
          ২য় কিস্তি: {formatDate(member.secondKistiDate)}
        </span>
      </div>
    </div>
  )
}

// ── VO Accordion Card ───────────────────────────────────
const VOSecondKistiCard = ({ vo, members, idx, navigateToVO }) => {
  const [expanded, setExpanded] = useState(false)

  const gradients = [
    ['#0ea5e9', '#0284c7'],
    ['#059669', '#047857'],
    ['#4f46e5', '#7c3aed'],
    ['#0891b2', '#0e7490'],
    ['#d97706', '#b45309'],
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
            padding: '0.65rem', border: 'none', background: '#fafafa', color: '#0369a1',
            fontSize: 13, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif",
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
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
          {members.map(m => <SecondKistiMemberRow key={m.id} member={m} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────
const SecondKistiPage = () => {
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

        const d = parseDisbursementDate(m.loan_disbursement_date)
        if (!d) return
        const disbDateStr = m.loan_disbursement_date

        const secondKistiDate = addMonthsToDate(d, 2)
        if (secondKistiDate.startsWith(currentYM)) {
          // Show only if NOT paid this month
          const paidThisMonth = m.last_paid_date && m.last_paid_date.startsWith(currentYM)
          if (!paidThisMonth) {
            list.push({ ...m, loan_disbursement_date: disbDateStr, secondKistiDate })
          }
        }
      })

      setMembers(list)
    } catch (err) {
      console.error('Second kisti fetch error:', err)
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
            ২য় কিস্তি রিপোর্ট
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
            ঋণ বিতরণের ২য় মাসের কিস্তির ভিও-ভিত্তিক রিপোর্ট
          </p>
        </div>
        <button
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
          {[
            { icon: MdPeople, label: '২য় কিস্তির সদস্য', value: filteredMembers.length, g1: '#0ea5e9', g2: '#0284c7' },
            { icon: MdGroups, label: 'ভিও সংখ্যা', value: byVO.length, g1: '#059669', g2: '#047857' },
            { icon: MdEventAvailable, label: 'ধাপ', value: '২য় মাস', g1: '#84cc16', g2: '#65a30d' },
          ].map(({ icon: IC, label, value, g1, g2 }) => (
            <div key={label} style={{
              background: `linear-gradient(135deg,${g1},${g2})`,
              borderRadius: 16, padding: '0.9rem', textAlign: 'center',
              boxShadow: `0 4px 16px ${g1}30`,
            }}>
              <IC style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, marginBottom: 4 }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="সদস্যের নাম, নম্বর বা ভিও দিয়ে খুঁজুন..."
            style={{
              width: '100%', padding: '10px 14px 10px 38px',
              borderRadius: 14, border: '1.5px solid #e2e8f0',
              fontSize: 13.5, outline: 'none', fontFamily: "'Hind Siliguri', sans-serif",
              background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          />
        </div>
      </div>

      {/* VO Accordions */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
        </div>
      ) : byVO.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
            ২য় কিস্তির কোনো সদস্য পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {byVO.map(({ voNum, members: mems, vo }, idx) => (
            <VOSecondKistiCard key={voNum} vo={vo} members={mems} idx={idx} navigateToVO={(num) => navigate(`/vo/${num}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SecondKistiPage
