import React, { useState, useEffect } from 'react'
import {
  MdClose, MdPerson, MdPhone, MdAttachMoney, MdWarning,
  MdLocationOn, MdEventAvailable, MdCurrencyExchange, MdSchedule,
  MdCalendarToday, MdNotes
} from 'react-icons/md'

const defaultForm = {
  full_name: '', father_name: '',
  member_number: '',
  village: '', post_office: '', upazila: '', district: '',
  phone_number: '', phone_number_2: '', phone_number_3: '',
  vo_number: '',
  loan_amount: '', is_due: false, is_called: false,
  loan_payment_date: '',
  loan_cleared_date: '',
  expected_payment_date: '',
  extra_amount: '',
  extra_amount_date: '',
  extra_amount_note: '',
}

// ── Sub-components ─────────────────────────────────────
const SectionLabel = ({ icon: Icon, label, color = '#4338ca' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.65rem', paddingBottom: '0.4rem', borderBottom: '1.5px solid #f1f5f9' }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon style={{ color, fontSize: 14 }} />
    </div>
    <span style={{ fontSize: 11.5, fontWeight: 700, color, fontFamily: "'Hind Siliguri', sans-serif", letterSpacing: 0.3 }}>{label}</span>
  </div>
)

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label className="field-label">
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      {hint && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 4, fontSize: 10 }}>({hint})</span>}
    </label>
    {children}
    {error && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3, fontFamily: "'Hind Siliguri', sans-serif" }}>{error}</p>}
  </div>
)

const ToggleRow = ({ label, icon: Icon, color, checked, onChange, id }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.65rem 0.9rem', borderRadius: 12,
    background: checked
      ? color === 'red' ? '#fef2f2' : color === 'green' ? '#f0fdf4' : '#eff6ff'
      : '#f8fafc',
    border: `1.5px solid ${checked
      ? color === 'red' ? '#fca5a5' : color === 'green' ? '#86efac' : '#93c5fd'
      : '#e2e8f0'}`,
    transition: 'all 0.2s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon style={{ fontSize: 17, color: checked ? (color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : '#3b82f6') : '#94a3b8' }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: "'Hind Siliguri', sans-serif" }}>{label}</span>
    </div>
    <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <div style={{ width: 44, height: 24, borderRadius: 12, background: checked ? (color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : '#3b82f6') : '#cbd5e1', position: 'relative', transition: 'background 0.25s' }}>
        <div style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform 0.25s', transform: checked ? 'translateX(20px)' : 'none' }} />
      </div>
    </label>
  </div>
)

// ── Main ───────────────────────────────────────────────
const MemberFormModal = ({ isOpen, onClose, onSubmit, editData, voGroups, defaultVONumber }) => {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const isEdit = !!editData

  useEffect(() => {
    if (editData) {
      setForm({
        full_name: editData.full_name || '',
        father_name: editData.father_name || '',
        member_number: editData.member_number || '',
        village: editData.village || '',
        post_office: editData.post_office || '',
        upazila: editData.upazila || '',
        district: editData.district || '',
        phone_number: editData.phone_number || '',
        phone_number_2: editData.phone_number_2 || '',
        phone_number_3: editData.phone_number_3 || '',
        vo_number: editData.vo_number || '',
        loan_amount: editData.loan_amount || '',
        is_due: editData.is_due || false,
        is_called: editData.is_called || false,
        loan_payment_date: editData.loan_payment_date || '',
        loan_cleared_date: editData.loan_cleared_date || '',
        expected_payment_date: editData.expected_payment_date || '',
        extra_amount: editData.extra_amount || '',
        extra_amount_date: editData.extra_amount_date || '',
        extra_amount_note: editData.extra_amount_note || '',
      })
    } else {
      setForm({ ...defaultForm, vo_number: defaultVONumber || '' })
    }
    setErrors({})
  }, [editData, isOpen, defaultVONumber])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'পূর্ণ নাম আবশ্যক'
    if (!form.vo_number) errs.vo_number = 'ভিও নম্বর আবশ্যক'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    await onSubmit({
      ...form,
      member_number: form.member_number || null,
      vo_number: parseInt(form.vo_number),
      loan_amount:   form.loan_amount   ? parseFloat(form.loan_amount)   : null,
      extra_amount:  form.extra_amount  ? parseFloat(form.extra_amount)  : null,
      loan_payment_date:     form.loan_payment_date     || null,
      loan_cleared_date:     form.loan_cleared_date     || null,
      expected_payment_date: form.expected_payment_date || null,
      extra_amount_date:     form.extra_amount_date     || null,
      extra_amount_note:     form.extra_amount_note     || null,
    })
    setLoading(false)
    onClose()
  }

  const inp = (field, extraStyle = {}) => ({
    className: `field-input${errors[field] ? ' error' : ''}`,
    name: field, value: form[field], onChange: handleChange,
    style: { fontFamily: "'Hind Siliguri', sans-serif", ...extraStyle },
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', width: '100%', maxWidth: 680,
        borderRadius: '24px 24px 0 0',
        maxHeight: '95vh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 -8px 40px rgba(15,23,42,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '24px 24px 0 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdPerson style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
                {isEdit ? 'সদস্য সম্পাদনা' : 'নতুন সদস্য যোগ করুন'}
              </h2>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                {isEdit ? 'তথ্য পরিবর্তন করুন' : 'নতুন সদস্যের তথ্য দিন'}
              </p>
            </div>
          </div>
          <button id="close-modal-btn" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MdClose style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Scroll body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.25rem' }}>

          {/* ── Personal ── */}
          <div style={{ marginBottom: '1rem' }}>
            <SectionLabel icon={MdPerson} label="ব্যক্তিগত তথ্য" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="পূর্ণ নাম" required error={errors.full_name}>
                  <input id="field-full-name" {...inp('full_name')} placeholder="সদস্যের পূর্ণ নাম" />
                </Field>
              </div>
              <Field label="সদস্য নাম্বার" hint="অনন্য পরিচয় নম্বর">
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 13, fontWeight: 800, color: form.member_number ? '#4f46e5' : '#cbd5e1',
                    pointerEvents: 'none', lineHeight: 1,
                  }}>#</span>
                  <input
                    id="field-member-number"
                    {...inp('member_number')}
                    placeholder="যেমন: ০০১, M-২৫"
                    style={{
                      fontFamily: "'Hind Siliguri', sans-serif",
                      paddingLeft: 24,
                      background: form.member_number ? '#eef2ff' : undefined,
                      borderColor: form.member_number ? '#a5b4fc' : undefined,
                      fontWeight: form.member_number ? 700 : 400,
                    }}
                  />
                </div>
              </Field>
              <Field label="স্বামী/পিতার নাম">
                <input id="field-father-name" {...inp('father_name')} placeholder="স্বামী বা পিতার নাম" />
              </Field>
              <Field label="প্রধান মোবাইল নম্বর">
                <input id="field-phone" {...inp('phone_number')} placeholder="০১XXXXXXXXX" type="tel" />
              </Field>
              <Field label="বিকল্প মোবাইল নম্বর ১">
                <input id="field-phone-2" {...inp('phone_number_2')} placeholder="০১XXXXXXXXX" type="tel" />
              </Field>
              <Field label="বিকল্প মোবাইল নম্বর ২">
                <input id="field-phone-3" {...inp('phone_number_3')} placeholder="০১XXXXXXXXX" type="tel" />
              </Field>
            </div>
          </div>

          {/* ── Address ── */}
          <div style={{ marginBottom: '1rem' }}>
            <SectionLabel icon={MdLocationOn} label="ঠিকানা" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <Field label="গ্রাম"><input id="field-village" {...inp('village')} placeholder="গ্রামের নাম" /></Field>
              <Field label="ডাকঘর"><input id="field-post-office" {...inp('post_office')} placeholder="ডাকঘর" /></Field>
              <Field label="উপজেলা"><input id="field-upazila" {...inp('upazila')} placeholder="উপজেলা" /></Field>
              <Field label="জেলা"><input id="field-district" {...inp('district')} placeholder="জেলা" /></Field>
            </div>
          </div>

          {/* ── VO & Loan ── */}
          <div style={{ marginBottom: '1rem' }}>
            <SectionLabel icon={MdAttachMoney} label="ঋণ তথ্য" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>

              <Field label="ভিও নম্বর" required error={errors.vo_number}>
                <select id="field-vo-number" {...inp('vo_number')} disabled={!!defaultVONumber}>
                  <option value="">ভিও নির্বাচন করুন</option>
                  {voGroups?.map(vo => (
                    <option key={vo.id} value={vo.vo_number}>
                      VO-{String(vo.vo_number).padStart(2, '0')} {vo.vo_name ? `(${vo.vo_name})` : ''}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="ঋণের পরিমাণ (৳)">
                <input id="field-loan-amount" {...inp('loan_amount')} type="number" placeholder="পরিমাণ" />
              </Field>

              {/* Kisti date */}
              <Field label="কিস্তির নির্ধারিত তারিখ">
                <input id="field-loan-date" {...inp('loan_payment_date')} type="date"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", borderColor: form.loan_payment_date && new Date(form.loan_payment_date) < new Date() ? '#fca5a5' : undefined }} />
              </Field>

              {/* Expected payment date — NEW */}
              <Field label="কিস্তি পাওয়ার সম্ভব্য তারিখ" hint="কল পরবর্তী তারিখ">
                <div style={{ position: 'relative' }}>
                  <input id="field-expected-date" {...inp('expected_payment_date')} type="date"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif", paddingRight: 32, background: form.expected_payment_date ? '#eff6ff' : undefined, borderColor: form.expected_payment_date ? '#93c5fd' : undefined }} />
                  <MdSchedule style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: form.expected_payment_date ? '#3b82f6' : '#94a3b8', fontSize: 15, pointerEvents: 'none' }} />
                </div>
              </Field>

              {/* Cleared date */}
              <Field label="ঋণ পরিশোধের তারিখ" hint="পরিশোধ হলে">
                <div style={{ position: 'relative' }}>
                  <input id="field-loan-cleared-date" {...inp('loan_cleared_date')} type="date"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif", paddingRight: 32, background: form.loan_cleared_date ? '#f0fdf4' : undefined, borderColor: form.loan_cleared_date ? '#86efac' : undefined }} />
                  <MdEventAvailable style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: form.loan_cleared_date ? '#22c55e' : '#94a3b8', fontSize: 15, pointerEvents: 'none' }} />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Extra amount block ── */}
          <div style={{ marginBottom: '1rem', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: '0.9rem' }}>
            <SectionLabel icon={MdCurrencyExchange} label="অতিরিক্ত পাওনা" color="#92400e" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <Field label="পাওনার পরিমাণ (৳)">
                <input id="field-extra-amount" {...inp('extra_amount')} type="number" placeholder="পরিমাণ"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", background: form.extra_amount ? '#fef9c3' : '#fff', borderColor: form.extra_amount ? '#fde68a' : undefined }} />
              </Field>
              <Field label="পাওনার তারিখ">
                <input id="field-extra-amount-date" {...inp('extra_amount_date')} type="date"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", background: form.extra_amount_date ? '#fef9c3' : '#fff', borderColor: form.extra_amount_date ? '#fde68a' : undefined }} />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="নোট / বিবরণ">
                  <div style={{ position: 'relative' }}>
                    <MdNotes style={{ position: 'absolute', left: 10, top: 10, color: '#d97706', fontSize: 15, pointerEvents: 'none' }} />
                    <textarea
                      id="field-extra-note"
                      name="extra_amount_note"
                      value={form.extra_amount_note}
                      onChange={handleChange}
                      placeholder="পাওনার কারণ বা বিস্তারিত বিবরণ লিখুন..."
                      rows={2}
                      style={{
                        fontFamily: "'Hind Siliguri', sans-serif",
                        width: '100%', padding: '8px 10px 8px 32px',
                        border: '1.5px solid #fde68a', borderRadius: 12,
                        fontSize: '0.9rem', color: '#1e293b',
                        resize: 'vertical', outline: 'none',
                        background: form.extra_amount_note ? '#fef9c3' : '#fff',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)' }}
                      onBlur={e => { e.target.style.borderColor = '#fde68a'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* ── Status toggles ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ToggleRow id="field-is-due" label="বকেয়া আছে" icon={MdWarning} color="red"
              checked={form.is_due} onChange={e => setForm(p => ({ ...p, is_due: e.target.checked }))} />
            <ToggleRow id="field-is-called" label="কল করা হয়েছে" icon={MdPhone} color="green"
              checked={form.is_called} onChange={e => setForm(p => ({ ...p, is_called: e.target.checked }))} />
          </div>
        </form>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '0.9rem 1.25rem', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fafafa' }}>
          <button id="cancel-form-btn" type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>বাতিল</button>
          <button id="submit-form-btn" type="submit" onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />সংরক্ষণ হচ্ছে...</>
              : isEdit ? 'আপডেট করুন' : 'সদস্য যোগ করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MemberFormModal
