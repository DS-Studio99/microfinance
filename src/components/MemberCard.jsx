import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  MdCheckCircle, MdCancel, MdPhone, MdPhoneDisabled,
  MdEdit, MdDelete, MdCalendarToday, MdLocationOn, MdAttachMoney,
  MdWarning, MdAccessTime, MdMoreVert, MdCurrencyExchange,
  MdEventAvailable, MdMessage, MdQuestionMark, MdClose,
  MdSchedule, MdNotes, MdVerified,
} from 'react-icons/md'
import { RiWhatsappFill } from 'react-icons/ri'
import { useSettingsStore } from '../store/settingsStore'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
export const formatAddress = (m) => {
  const parts = [m.village, m.post_office, m.upazila, m.district].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : ''
}

export const formatMoney = (amount) => {
  if (!amount) return '—'
  return new Intl.NumberFormat('bn-BD').format(amount) + ' ৳'
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const getDaysOverdue = (date) => {
  if (!date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - d) / 86400000)
  return diff > 0 ? diff : null
}

const getSeverity = (days) => {
  if (!days) return null
  if (days >= 90) return { bg: '#450a0a', pill: '#7f1d1d', label: 'অতি জরুরি' }
  if (days >= 30) return { bg: '#dc2626', pill: '#b91c1c', label: 'গুরুতর' }
  if (days >= 7) return { bg: '#ea580c', pill: '#c2410c', label: 'মনোযোগ দিন' }
  return { bg: '#d97706', pill: '#b45309', label: 'সামান্য' }
}

// International Bangladesh phone (for WA/IMO)
const intlPhone = (phone) => {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('880')) return digits
  if (digits.startsWith('0')) return '880' + digits.slice(1)
  return '880' + digits
}

// ─────────────────────────────────────────
// Small confirm popover
// ─────────────────────────────────────────
const ConfirmPopover = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
    zIndex: 200, background: '#1e293b', color: '#fff',
    borderRadius: 14, padding: '10px 14px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
    minWidth: 200, animation: 'scaleUp 0.15s ease-out',
    whiteSpace: 'nowrap',
  }}>
    {/* Arrow */}
    <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: '#1e293b', borderRadius: 2, rotate: '45deg' }} />
    <p style={{ fontSize: 12, fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 8, textAlign: 'center', color: '#e2e8f0' }}>{message}</p>
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: '5px 0', borderRadius: 8, border: '1px solid #475569', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontFamily: "'Hind Siliguri', sans-serif" }}>না</button>
      <button onClick={onConfirm} style={{ flex: 1, padding: '5px 0', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>হ্যাঁ</button>
    </div>
  </div>
)

// ─────────────────────────────────────────
// ToggleButton with confirm
// ─────────────────────────────────────────
const ToggleWithConfirm = ({ id, on, onColor, onClick, icon: Icon, label, confirmMsg }) => {
  const [pending, setPending] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!pending) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setPending(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [pending])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        id={id}
        onClick={() => setPending(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 20, border: 'none',
          cursor: 'pointer', fontSize: 11, fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: 600, transition: 'all 0.18s',
          ...(on
            ? onColor === 'red'
              ? { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
              : { background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd' }
            : { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }
          ),
        }}
      >
        <Icon style={{ fontSize: 12 }} />{label}
      </button>
      {pending && (
        <ConfirmPopover
          message={confirmMsg}
          onConfirm={() => { setPending(false); onClick() }}
          onCancel={() => setPending(false)}
        />
      )}
    </div>
  )
}

const ActionWithConfirm = ({ onClick, icon: Icon, label, confirmMsg, colorTheme = 'green' }) => {
  const [pending, setPending] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!pending) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setPending(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [pending])

  const colors = {
    green: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    blue: { bg: '#dbeafe', text: '#1e3a8a', border: '#93c5fd' },
    gray: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' }
  }[colorTheme]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => setPending(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 20, border: `1px solid ${colors.border}`,
          background: colors.bg, color: colors.text,
          cursor: 'pointer', fontSize: 11, fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: 600, transition: 'all 0.18s',
        }}
      >
        <Icon style={{ fontSize: 13 }} />{label}
      </button>
      {pending && (
        <ConfirmPopover
          message={confirmMsg}
          onConfirm={() => { setPending(false); onClick() }}
          onCancel={() => setPending(false)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// 3-dot menu
// ─────────────────────────────────────────
const ThreeDotMenu = ({ onEdit, onDelete, allowEdit, allowDelete }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          width: 30, height: 30, borderRadius: 8,
          border: '1px solid #e2e8f0',
          background: open ? '#f1f5f9' : '#fff',
          color: '#64748b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MdMoreVert style={{ fontSize: 18 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 34, right: 0, zIndex: 300,
          background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 30px rgba(15,23,42,0.15)',
          border: '1px solid #e8edf3', overflow: 'hidden', minWidth: 130,
          animation: 'scaleUp 0.15s ease-out',
        }}>
          {allowEdit && (
            <button onClick={() => { setOpen(false); onEdit() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 0.9rem', border: 'none', background: 'none', color: '#4338ca', fontSize: 13, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MdEdit style={{ fontSize: 16 }} />সম্পাদনা
            </button>
          )}
          {allowEdit && allowDelete && <div style={{ height: 1, background: '#f1f5f9' }} />}
          {allowDelete && (
            <button onClick={() => { setOpen(false); onDelete() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 0.9rem', border: 'none', background: 'none', color: '#dc2626', fontSize: 13, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MdDelete style={{ fontSize: 16 }} />মুছে ফেলুন
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Info row
// ─────────────────────────────────────────
const InfoRow = ({ icon: Icon, iconColor = '#94a3b8', children, highlight }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 6,
    padding: highlight ? '5px 8px' : '2px 0',
    borderRadius: highlight ? 8 : 0,
    background: highlight || 'transparent',
    margin: highlight ? '1px -2px' : 0,
  }}>
    <Icon style={{ fontSize: 13, color: iconColor, marginTop: 1.5, flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
)

// ─────────────────────────────────────────
// Main Card
// ─────────────────────────────────────────
const MemberCard = ({ member, onEdit, onDelete, onToggleDue, onToggleCalled, onMarkPaid, onToggleConfirmed }) => {
  const { allowEdit, allowDelete } = useSettingsStore()
  const today = new Date().toISOString().split('T')[0]
  const isToday = member.loan_payment_date === today
  const daysOverdue = getDaysOverdue(member.loan_payment_date)
  const sev = daysOverdue ? getSeverity(daysOverdue) : null
  const hasExtraAmount = member.extra_amount && parseFloat(member.extra_amount) > 0
  const hasClearedDate = !!member.loan_cleared_date
  const hasExpectedDate = !!member.expected_payment_date
  const phone = member.phone_number || ''
  const intl = intlPhone(phone)

  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      border: hasClearedDate
        ? '1.5px solid #86efac'
        : isToday
          ? '1.5px solid #fbbf24'
          : daysOverdue && member.is_due
            ? '1.5px solid #fca5a5'
            : '1px solid #e8edf3',
      boxShadow: daysOverdue && member.is_due
        ? '0 4px 20px rgba(239,68,68,0.1)'
        : '0 2px 10px rgba(15,23,42,0.07)',
      overflow: 'hidden',
      transition: 'transform 0.18s, box-shadow 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,23,42,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >

      {/* ── Top colour banner ── */}
      {hasClearedDate ? (
        <div style={{ background: 'linear-gradient(90deg,#16a34a,#22c55e)', padding: '5px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdEventAvailable style={{ fontSize: 13 }} />ঋণ পরিশোধ সম্পন্ন
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: "'Hind Siliguri', sans-serif" }}>{formatDate(member.loan_cleared_date)}</span>
        </div>
      ) : isToday ? (
        <div style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)', padding: '5px 13px' }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdCalendarToday style={{ fontSize: 12 }} />আজ কিস্তির নির্ধারিত তারিখ
          </span>
        </div>
      ) : daysOverdue && member.is_due && sev ? (
        <div style={{ background: `linear-gradient(90deg,${sev.bg},${sev.pill})`, padding: '5px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdWarning style={{ fontSize: 13 }} />মেয়াদ উত্তীর্ণ — {sev.label}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 20, padding: '1px 8px', color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 3 }}>
            <MdAccessTime style={{ fontSize: 11 }} />{daysOverdue} দিন
          </span>
        </div>
      ) : null}

      <div style={{ padding: '11px 12px 10px' }}>

        {/* ── Name row ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 5 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.25, wordBreak: 'break-word', margin: 0 }}>
                {member.full_name}
              </h3>
              {member.is_confirmed && (
                <div title="নিশ্চিত কিস্তি পাবো" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: '50%', width: 20, height: 20, flexShrink: 0 }}>
                  <MdVerified style={{ fontSize: 13 }} />
                </div>
              )}
            </div>
            {member.father_name && (
              <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", margin: '2px 0 0 0' }}>স্বামী/পিতা: {member.father_name}</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Member number badge */}
            {member.member_number && (
              <span style={{
                background: 'linear-gradient(135deg,#0f172a,#1e293b)',
                color: '#e2e8f0',
                borderRadius: 8, padding: '3px 8px',
                fontSize: 10, fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 3,
                letterSpacing: 0.3,
              }}>
                # {member.member_number}
              </span>
            )}
            {/* VO badge */}
            <span style={{ background: '#eef2ff', color: '#4338ca', borderRadius: 8, padding: '3px 7px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
              VO-{String(member.vo_number).padStart(2, '0')}
            </span>
            {(allowEdit || allowDelete) && (
              <ThreeDotMenu onEdit={() => onEdit(member)} onDelete={() => onDelete(member)} allowEdit={allowEdit} allowDelete={allowDelete} />
            )}
          </div>
        </div>

        {/* ── Address ── */}
        {formatAddress(member) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
            <MdLocationOn style={{ fontSize: 12, color: '#94a3b8', marginTop: 1.5, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.4 }}>{formatAddress(member)}</p>
          </div>
        )}

        {/* ── Info block ── */}
        <div style={{ background: '#f8fafc', borderRadius: 11, padding: '8px 10px', marginBottom: 9, display: 'flex', flexDirection: 'column', gap: 5 }}>

          {/* Multiple Phone numbers + action buttons */}
          {[member.phone_number, member.phone_number_2, member.phone_number_3].filter(Boolean).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[member.phone_number, member.phone_number_2, member.phone_number_3].filter(Boolean).map((phoneObj, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                  <MdPhone style={{ fontSize: 13, color: '#6366f1', flexShrink: 0 }} />
                  <a href={`tel:${phoneObj}`} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }} title="কল করুন">
                    {phoneObj}
                  </a>
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${intlPhone(phoneObj)}`}
                    target="_blank" rel="noreferrer"
                    title="WhatsApp"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: 6,
                      background: '#dcfce7', color: '#16a34a', textDecoration: 'none',
                      flexShrink: 0, transition: 'transform 0.15s', marginLeft: 4,
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    <RiWhatsappFill style={{ fontSize: 15 }} />
                  </a>
                  {/* IMO */}
                  <a
                    href={`https://www.imo.im/chat?phone=${intlPhone(phoneObj)}`}
                    target="_blank" rel="noreferrer"
                    title="IMO"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: 6,
                      background: '#ede9fe', color: '#7c3aed', textDecoration: 'none',
                      flexShrink: 0, fontSize: 10, fontWeight: 800,
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    imo
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <InfoRow icon={MdPhone}><span style={{ fontSize: 12, color: '#94a3b8' }}>ফোন নম্বর নেই</span></InfoRow>
          )}

          {/* Loan amount */}
          <InfoRow icon={MdAttachMoney} iconColor="#059669">
            <span style={{ fontSize: 12, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>ঋণ: {formatMoney(member.loan_amount)}</span>
          </InfoRow>

          {/* Extra amount — yellow highlighted */}
          {hasExtraAmount && (
            <div style={{ background: 'linear-gradient(90deg,#fef9c3,#fef3c7)', borderRadius: 8, padding: '5px 8px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 2, margin: '1px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MdCurrencyExchange style={{ fontSize: 13, color: '#d97706' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  অতিরিক্ত পাওনা: {formatMoney(member.extra_amount)}
                </span>
                {member.extra_amount_date && (
                  <span style={{ fontSize: 10, color: '#b45309', background: '#fde68a', borderRadius: 5, padding: '1px 5px', fontFamily: "'Hind Siliguri', sans-serif", marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {formatDate(member.extra_amount_date)}
                  </span>
                )}
              </div>
              {member.extra_amount_note && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, paddingLeft: 18 }}>
                  <MdNotes style={{ fontSize: 11, color: '#a16207', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 11, color: '#78350f', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.4 }}>{member.extra_amount_note}</span>
                </div>
              )}
            </div>
          )}

          {/* Kisti date with overdue indicator */}
          <InfoRow
            icon={MdCalendarToday}
            iconColor={daysOverdue && member.is_due ? '#dc2626' : '#94a3b8'}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 12, color: daysOverdue && member.is_due ? '#dc2626' : '#334155', fontWeight: daysOverdue && member.is_due ? 700 : 400, fontFamily: "'Hind Siliguri', sans-serif" }}>
                কিস্তির তারিখ: {formatDate(member.loan_payment_date)}
              </span>
              {daysOverdue && member.is_due && (
                <span style={{ background: '#dc2626', color: '#fff', borderRadius: 6, padding: '1px 6px', fontSize: 10, fontWeight: 800, fontFamily: "'Hind Siliguri', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <MdAccessTime style={{ fontSize: 10 }} />{daysOverdue} দিন বেশি
                </span>
              )}
            </div>
          </InfoRow>

          {/* Expected payment date */}
          {hasExpectedDate && (
            <div style={{ background: hasClearedDate ? '#f0fdf4' : '#eff6ff', borderRadius: 8, padding: '4px 8px', border: `1px solid ${hasClearedDate ? '#86efac' : '#bfdbfe'}`, margin: '1px 0' }}>
              <InfoRow icon={MdSchedule} iconColor={hasClearedDate ? '#16a34a' : '#3b82f6'}>
                <span style={{ fontSize: 11, color: hasClearedDate ? '#15803d' : '#1d4ed8', fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif" }}>
                  কিস্তি পাওয়ার সম্ভব্য তারিখ: {formatDate(member.expected_payment_date)}
                </span>
              </InfoRow>
            </div>
          )}

          {/* Loan cleared date */}
          {hasClearedDate && (
            <InfoRow icon={MdEventAvailable} iconColor="#16a34a">
              <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif" }}>
                পরিশোধ হয়েছে: {formatDate(member.loan_cleared_date)}
              </span>
            </InfoRow>
          )}
        </div>

        {/* ── Status toggles with confirm ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <ToggleWithConfirm
            id={`toggle-due-${member.id}`}
            on={member.is_due}
            onColor="red"
            onClick={() => onToggleDue(member.id, !member.is_due)}
            label={member.is_due ? 'বকেয়া আছে' : 'বকেয়া নেই'}
            icon={member.is_due ? MdCancel : MdCheckCircle}
            confirmMsg={member.is_due ? 'বকেয়া পরিষ্কার করবেন?' : 'বকেয়া হিসেবে চিহ্নিত করবেন?'}
          />
          <ToggleWithConfirm
            id={`toggle-call-${member.id}`}
            on={member.is_called}
            onColor="blue"
            onClick={() => onToggleCalled(member.id, !member.is_called)}
            label={member.is_called ? 'কল হয়েছে' : 'কল হয়নি'}
            icon={member.is_called ? MdPhone : MdPhoneDisabled}
            confirmMsg={member.is_called ? 'কলের চিহ্ন সরাবেন?' : 'কল সম্পন্ন হিসেবে চিহ্নিত করবেন?'}
          />
          <ToggleWithConfirm
            id={`toggle-confirmed-${member.id}`}
            on={member.is_confirmed}
            onColor="green"
            onClick={() => onToggleConfirmed(member.id, !member.is_confirmed)}
            label={member.is_confirmed ? 'নিশ্চিত' : 'নিশ্চিত করুন'}
            icon={MdVerified}
            confirmMsg={member.is_confirmed ? 'নিশ্চিত মার্ক সরাবেন?' : 'নিশ্চিত পাবো হিসেবে চিহ্নিত করবেন?'}
          />
          {onMarkPaid && (member.loan_payment_date || member.expected_payment_date) && !member.loan_cleared_date && (
            <ActionWithConfirm
              onClick={() => onMarkPaid(member)}
              label="কিস্তি পরিশোধ করুন"
              icon={MdCheckCircle}
              confirmMsg="কিস্তি পরিশোধ নিশ্চিত করবেন? এর ফলে তারিখগুলো মুছে যাবে এবং আগামী মাসের জন্য রেডি হবে।"
              colorTheme="gray"
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default MemberCard
