import React, { useState, useRef, useEffect } from 'react'
import {
  MdCheckCircle, MdCancel, MdPhone, MdPhoneDisabled,
  MdEdit, MdDelete, MdCalendarToday, MdLocationOn,
  MdWarning, MdAccessTime, MdMoreVert, MdCurrencyExchange,
  MdEventAvailable, MdSchedule, MdNotes, MdVerified,
} from 'react-icons/md'
import { RiWhatsappFill } from 'react-icons/ri'
import { useSettingsStore } from '../store/settingsStore'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
export const formatAddress = (m) => m.village || ''

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
  if (days >= 90) return { bg: '#dc2626', pill: '#7f1d1d', label: 'অতি জরুরি' }
  if (days >= 30) return { bg: '#dc2626', pill: '#b91c1c', label: 'গুরুতর' }
  if (days >= 7) return { bg: '#ea580c', pill: '#c2410c', label: 'মনোযোগ দিন' }
  return { bg: '#d97706', pill: '#b45309', label: 'সামান্য' }
}

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
    position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)',
    zIndex: 200, background: '#0f172a', color: '#fff',
    borderRadius: 10, padding: '6px 10px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
    minWidth: 180, animation: 'scaleUp 0.15s ease-out',
    whiteSpace: 'nowrap',
  }}>
    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: '#0f172a', borderRadius: 1, rotate: '45deg' }} />
    <p style={{ fontSize: 10.5, fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 5, textAlign: 'center', color: '#e2e8f0' }}>{message}</p>
    <div style={{ display: 'flex', gap: 4 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: '3px 0', borderRadius: 4, border: '1px solid #475569', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 10, fontFamily: "'Hind Siliguri', sans-serif" }}>না</button>
      <button onClick={onConfirm} style={{ flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>হ্যাঁ</button>
    </div>
  </div>
)

// ─────────────────────────────────────────
// Toggle Button (Ultra-compact)
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
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 7px', borderRadius: 12, border: 'none',
          cursor: 'pointer', fontSize: 10, fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: 600, transition: 'all 0.15s',
          ...(on
            ? onColor === 'red'
              ? { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
              : onColor === 'green'
                ? { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }
                : { background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd' }
            : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }
          ),
        }}
      >
        <Icon style={{ fontSize: 11 }} />{label}
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
    gray: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' }
  }[colorTheme]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => setPending(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 7px', borderRadius: 12, border: `1px solid ${colors.border}`,
          background: colors.bg, color: colors.text,
          cursor: 'pointer', fontSize: 10, fontFamily: "'Hind Siliguri', sans-serif",
          fontWeight: 600, transition: 'all 0.15s',
        }}
      >
        <Icon style={{ fontSize: 11 }} />{label}
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
// 3-dot Menu
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
          width: 24, height: 24, borderRadius: 6,
          border: '1px solid #e2e8f0',
          background: open ? '#f1f5f9' : '#fff',
          color: '#64748b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MdMoreVert style={{ fontSize: 15 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 28, right: 0, zIndex: 300,
          background: '#fff', borderRadius: 8,
          boxShadow: '0 6px 20px rgba(15,23,42,0.15)',
          border: '1px solid #e2e8f0', overflow: 'hidden', minWidth: 110,
          animation: 'scaleUp 0.15s ease-out',
        }}>
          {allowEdit && (
            <button onClick={() => { setOpen(false); onEdit() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', border: 'none', background: 'none', color: '#4338ca', fontSize: 11, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MdEdit style={{ fontSize: 13 }} />সম্পাদনা
            </button>
          )}
          {allowEdit && allowDelete && <div style={{ height: 1, background: '#f1f5f9' }} />}
          {allowDelete && (
            <button onClick={() => { setOpen(false); onDelete() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', border: 'none', background: 'none', color: '#dc2626', fontSize: 11, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MdDelete style={{ fontSize: 13 }} />মুছে ফেলুন
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Main Ultra-Compact MemberCard
// ─────────────────────────────────────────
const MemberCard = ({ member, onEdit, onDelete, onToggleDue, onToggleCalled, onMarkPaid, onToggleConfirmed, onToggleLatePayer }) => {
  const { allowEdit, allowDelete } = useSettingsStore()
  const today = new Date().toISOString().split('T')[0]
  const isToday = member.loan_payment_date === today
  const daysOverdue = getDaysOverdue(member.loan_payment_date)
  const sev = daysOverdue ? getSeverity(daysOverdue) : null
  const hasExtraAmount = member.extra_amount && parseFloat(member.extra_amount) > 0
  const hasClearedDate = !!member.loan_cleared_date
  const hasExpectedDate = !!member.expected_payment_date
  const isPaidToday = member.last_paid_date === today
  const phones = [member.phone_number, member.phone_number_2, member.phone_number_3].filter(Boolean)
  const address = formatAddress(member)

  // Status indicator style
  const statusColor = hasClearedDate
    ? '#22c55e'
    : isPaidToday
      ? '#10b981'
      : isToday
        ? '#f59e0b'
        : daysOverdue && member.is_due
          ? '#ef4444'
          : null

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: statusColor ? `1.5px solid ${statusColor}` : '1px solid #e2e8f0',
      boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
      overflow: 'hidden',
      transition: 'all 0.15s ease',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,42,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 6px rgba(15,23,42,0.03)' }}
    >
      {/* Sleek top 3px accent line */}
      {statusColor && <div style={{ height: 3, background: statusColor, width: '100%' }} />}

      <div style={{ padding: '7px 9px 6px' }}>

        {/* ── Line 1: Name, Badges & Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <h3 style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {member.full_name}
            </h3>
            {member.is_confirmed && (
              <MdVerified style={{ fontSize: 13, color: '#10b981', flexShrink: 0 }} title="নিশ্চিত কিস্তি পাবো" />
            )}
            {/* Status Pill inline */}
            {hasClearedDate ? (
              <span style={{ fontSize: 9, background: '#dcfce7', color: '#15803d', borderRadius: 4, padding: '1px 4px', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>পরিশোধিত</span>
            ) : isPaidToday ? (
              <span style={{ fontSize: 9, background: '#d1fae5', color: '#047857', borderRadius: 4, padding: '1px 4px', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>আজ পরিশোধ</span>
            ) : isToday ? (
              <span style={{ fontSize: 9, background: '#fef3c7', color: '#b45309', borderRadius: 4, padding: '1px 4px', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>আজ নির্ধারণ</span>
            ) : daysOverdue && member.is_due ? (
              <span style={{ fontSize: 9, background: '#fee2e2', color: '#991b1b', borderRadius: 4, padding: '1px 4px', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>+{daysOverdue}দিন</span>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            {member.member_number && (
              <span style={{ background: '#f1f5f9', color: '#334155', borderRadius: 4, padding: '1px 5px', fontSize: 9.5, fontWeight: 700 }}>
                #{member.member_number}
              </span>
            )}
            <span style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 4, padding: '1px 5px', fontSize: 9.5, fontWeight: 700 }}>
              VO-{String(member.vo_number).padStart(2, '0')}
            </span>
            {(allowEdit || allowDelete) && (
              <ThreeDotMenu onEdit={() => onEdit(member)} onDelete={() => onDelete(member)} allowEdit={allowEdit} allowDelete={allowDelete} />
            )}
          </div>
        </div>

        {/* ── Line 2: Father Name & Address inline ── */}
        {(member.father_name || address) && (
          <div style={{ fontSize: 10, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {member.father_name && <span>স্বামী/পিতা: {member.father_name}</span>}
            {member.father_name && address && <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span>}
            {address && <span><MdLocationOn style={{ fontSize: 10, color: '#94a3b8', verticalAlign: 'middle', marginRight: 1 }} />{address}</span>}
          </div>
        )}

        {/* ── Compact Integrated Info Box ── */}
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '5px 7px', marginBottom: 6, display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #f1f5f9' }}>
          
          {/* Phones + Quick Contact Icons */}
          {phones.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              {phones.map((phoneObj, idx) => (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#fff', padding: '1px 5px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                  <MdPhone style={{ fontSize: 10, color: '#4f46e5' }} />
                  <a href={`tel:${phoneObj}`} style={{ fontSize: 10.5, color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                    {phoneObj}
                  </a>
                  <a href={`https://wa.me/${intlPhone(phoneObj)}`} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                    <RiWhatsappFill style={{ fontSize: 12 }} />
                  </a>
                  <a href={`https://www.imo.im/chat?phone=${intlPhone(phoneObj)}`} target="_blank" rel="noreferrer" title="IMO" style={{ color: '#7c3aed', fontSize: 8.5, fontWeight: 900, textDecoration: 'none', background: '#ede9fe', padding: '0 2px', borderRadius: 2 }}>
                    imo
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Key Stats Grid: Loan, Kisti & Dates in 1 Line / Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: '#fff', padding: '4px 6px', borderRadius: 6, border: '1px solid #edf2f7' }}>
            <div>
              <span style={{ fontSize: 9, color: '#64748b', display: 'block', fontFamily: "'Hind Siliguri', sans-serif" }}>ঋণ (মাসিক কিস্তি)</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
                {formatMoney(member.loan_amount)} {member.loan_amount > 0 && <span style={{ color: '#166534', fontWeight: 700 }}>({formatMoney(member.loan_amount * 0.1)})</span>}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 9, color: daysOverdue && member.is_due ? '#dc2626' : '#64748b', display: 'block', fontFamily: "'Hind Siliguri', sans-serif" }}>
                কিস্তির তারিখ
              </span>
              <span style={{ fontSize: 11, color: daysOverdue && member.is_due ? '#dc2626' : '#334155', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>
                {formatDate(member.loan_payment_date)}
              </span>
            </div>
          </div>

          {/* Sub-dates row (if disbursement / expected / cleared date present) */}
          {(hasExpectedDate || member.loan_disbursement_date || hasClearedDate) && (
            <div style={{ fontSize: 10, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              {hasExpectedDate && <span style={{ color: '#1d4ed8', fontWeight: 600 }}>সম্ভাব্য: {formatDate(member.expected_payment_date)}</span>}
              {!hasExpectedDate && member.loan_disbursement_date && <span style={{ color: '#15803d', fontWeight: 600 }}>বিতরণ: {formatDate(member.loan_disbursement_date)}</span>}
              {!hasExpectedDate && !member.loan_disbursement_date && hasClearedDate && <span style={{ color: '#15803d', fontWeight: 600 }}>পরিশোধ: {formatDate(member.loan_cleared_date)}</span>}
            </div>
          )}

          {/* Extra Amount Highlight */}
          {hasExtraAmount && (
            <div style={{ background: '#fef3c7', borderRadius: 4, padding: '3px 6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <MdCurrencyExchange style={{ fontSize: 11, color: '#d97706' }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  অতিরিক্ত: {formatMoney(member.extra_amount)}
                </span>
              </div>
              {member.extra_amount_date && (
                <span style={{ fontSize: 9, color: '#b45309', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {formatDate(member.extra_amount_date)}
                </span>
              )}
            </div>
          )}

          {/* Extra Note */}
          {member.extra_amount_note && (
            <div style={{ background: '#fffbeb', borderRadius: 4, padding: '3px 6px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              <MdNotes style={{ fontSize: 10, color: '#b45309', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 10, color: '#78350f', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.2 }}>{member.extra_amount_note}</span>
            </div>
          )}
        </div>

        {/* ── Line 3: Ultra-Compact Status Toggles ── */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <ToggleWithConfirm
            id={`toggle-due-${member.id}`}
            on={member.is_due}
            onColor="red"
            onClick={() => onToggleDue(member.id, !member.is_due)}
            label={member.is_due ? 'বকেয়া' : 'বকেয়া মুক্ত'}
            icon={member.is_due ? MdCancel : MdCheckCircle}
            confirmMsg={member.is_due ? 'বকেয়া পরিষ্কার করবেন?' : 'বকেয়া হিসেবে চিহ্নিত করবেন?'}
          />
          <ToggleWithConfirm
            id={`toggle-call-${member.id}`}
            on={member.is_called}
            onColor="blue"
            onClick={() => onToggleCalled(member.id, !member.is_called)}
            label={member.is_called ? 'কলড' : 'কল হয়নি'}
            icon={member.is_called ? MdPhone : MdPhoneDisabled}
            confirmMsg={member.is_called ? 'কলের চিহ্ন সরাবেন?' : 'কল সম্পন্ন হিসেবে চিহ্নিত করবেন?'}
          />
          {onToggleLatePayer && (
            <ToggleWithConfirm
              id={`toggle-late-${member.id}`}
              on={member.is_late_payer}
              onColor="red"
              onClick={() => onToggleLatePayer(member.id, !member.is_late_payer)}
              label={member.is_late_payer ? 'লেটকারী' : 'নিয়মিত'}
              icon={MdSchedule}
              confirmMsg={member.is_late_payer ? 'লেটকারীর তালিকা থেকে সরাবেন?' : 'নিয়মিত লেটকারী হিসেবে চিহ্নিত করবেন?'}
            />
          )}
          <ToggleWithConfirm
            id={`toggle-confirmed-${member.id}`}
            on={member.is_confirmed}
            onColor="green"
            onClick={() => onToggleConfirmed(member.id, !member.is_confirmed)}
            label={member.is_confirmed ? 'নিশ্চিত' : 'নিশ্চিত'}
            icon={MdVerified}
            confirmMsg={member.is_confirmed ? 'নিশ্চিত মার্ক সরাবেন?' : 'নিশ্চিত পাবো হিসেবে চিহ্নিত করবেন?'}
          />
          {onMarkPaid && (member.loan_payment_date || member.expected_payment_date) && !member.loan_cleared_date && (
            <ActionWithConfirm
              onClick={() => onMarkPaid(member)}
              label="পরিশোধ"
              icon={MdCheckCircle}
              confirmMsg="কিস্তি পরিশোধ নিশ্চিত করবেন? তারিখ আগামী মাসের জন্য আপডেট হবে।"
              colorTheme="gray"
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default MemberCard

