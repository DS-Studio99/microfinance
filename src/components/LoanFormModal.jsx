import React, { useState, useEffect } from 'react'
import {
  MdClose, MdPerson, MdHome, MdGroups, MdBadge, MdCalendarToday,
  MdCreditCard, MdFamilyRestroom, MdChildCare, MdSchool, MdCheck,
  MdArrowForward, MdSave, MdAttachMoney, MdNotes
} from 'react-icons/md'

const CARD_TYPES = ['NID', 'জন্ম নিবন্ধন সনদ']

const initialForm = {
  member_name: '',
  full_address: '',
  vo_number: '',
  member_number: '',
  birth_date: '',
  card_type: 'NID',
  id_number: '',
  father_name: '',
  mother_name: '',
  husband_name: '',
  total_members: '',
  total_children: '',
  school_going: '',
  under_five: '',
  loan_amount: '',
  loan_purpose: '',
  notes: '',
  phone_number: '',
  status: 'pending'
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: '#475569',
  fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 4, display: 'block'
}

const FormField = ({ label, icon: Icon, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={labelStyle}>
      {Icon && <Icon style={{ fontSize: 13, marginRight: 5, verticalAlign: 'middle' }} />}
      {label}
    </label>
    {children}
  </div>
)

const LoanFormModal = ({ isOpen, onClose, onSubmit, editData, voGroups }) => {
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editData) {
      setForm({
        ...initialForm,
        ...editData,
        loan_amount: editData.loan_amount?.toString() || '',
        total_members: editData.total_members?.toString() || '',
        total_children: editData.total_children?.toString() || '',
        school_going: editData.school_going?.toString() || '',
        under_five: editData.under_five?.toString() || '',
      })
    } else {
      setForm(initialForm)
    }
    setStep(1)
  }, [editData, isOpen])

  if (!isOpen) return null

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.member_name.trim()) return alert('সদস্যের নাম দিন')
    if (!form.vo_number) return alert('ভিও নম্বর দিন')
    
    setSubmitting(true)
    const success = await onSubmit({
      ...form,
      loan_amount: form.loan_amount ? parseFloat(form.loan_amount) : null,
      total_members: form.total_members ? parseInt(form.total_members) : null,
      total_children: form.total_children ? parseInt(form.total_children) : null,
      school_going: form.school_going ? parseInt(form.school_going) : null,
      under_five: form.under_five ? parseInt(form.under_five) : null,
      vo_number: parseInt(form.vo_number),
    })
    setSubmitting(false)
    if (success) onClose()
  }

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
    fontFamily: "'Hind Siliguri', sans-serif", transition: 'border-color 0.2s',
    boxSizing: 'border-box', background: '#fff', color: '#0f172a',
  }

  const stepInfo = [
    { num: 1, title: 'ব্যক্তিগত', icon: MdPerson },
    { num: 2, title: 'পরিবার', icon: MdFamilyRestroom },
    { num: 3, title: 'লোন', icon: MdBadge },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: '24px 24px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {editData ? 'আবেদন সংশোধন' : 'নতুন লোন আবেদন'}
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>ধাপ {step} / ৩</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdClose style={{ fontSize: 18, color: '#64748b' }} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
            {stepInfo.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === s.num ? '#4f46e5' : step > s.num ? '#10b981' : '#f1f5f9', color: step >= s.num ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                    {step > s.num ? <MdCheck /> : s.num}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: step >= s.num ? '#4f46e5' : '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>{s.title}</span>
                </div>
                {idx < 2 && <div style={{ flex: 1, height: 2, background: step > s.num ? '#10b981' : '#f1f5f9', margin: '0 10px', marginBottom: 14 }} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div style={{ gridColumn: '1/-1' }}><FormField label="সদস্যের নাম *" icon={MdPerson}><input style={fieldStyle} placeholder="নাম লিখুন" value={form.member_name} onChange={e => handleChange('member_name', e.target.value)} /></FormField></div>
              <div style={{ gridColumn: '1/-1' }}><FormField label="পূর্ণ ঠিকানা" icon={MdHome}><textarea style={{ ...fieldStyle, minHeight: 60 }} placeholder="ঠিকানা লিখুন" value={form.full_address} onChange={e => handleChange('full_address', e.target.value)} /></FormField></div>
              <div style={{ gridColumn: '1/-1' }}><FormField label="মোবাইল নম্বর" icon={MdPerson}><input style={fieldStyle} placeholder="০১XXXXXXXXX" value={form.phone_number} onChange={e => handleChange('phone_number', e.target.value)} /></FormField></div>
              <FormField label="ভিও নম্বর *" icon={MdGroups}>
                <select style={fieldStyle} value={form.vo_number} onChange={e => handleChange('vo_number', e.target.value)}>
                  <option value="">সিলেক্ট</option>
                  {voGroups.map(v => <option key={v.id} value={v.vo_number}>VO-{v.vo_number}</option>)}
                </select>
              </FormField>
              <FormField label="সদস্য নম্বর *" icon={MdBadge}><input style={fieldStyle} placeholder="সদস্য নং" value={form.member_number} onChange={e => handleChange('member_number', e.target.value)} /></FormField>
              <FormField label="জন্ম তারিখ" icon={MdCalendarToday}><input type="date" style={fieldStyle} value={form.birth_date} onChange={e => handleChange('birth_date', e.target.value)} /></FormField>
              <FormField label="কার্ড টাইপ" icon={MdCreditCard}><select style={fieldStyle} value={form.card_type} onChange={e => handleChange('card_type', e.target.value)}>{CARD_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select></FormField>
              <div style={{ gridColumn: '1/-1' }}><FormField label="আইডি নম্বর" icon={MdCreditCard}><input style={fieldStyle} placeholder="NID / জন্ম নিবন্ধন" value={form.id_number} onChange={e => handleChange('id_number', e.target.value)} /></FormField></div>
              <FormField label="পিতার নাম"><input style={fieldStyle} value={form.father_name} onChange={e => handleChange('father_name', e.target.value)} /></FormField>
              <FormField label="মাতার নাম"><input style={fieldStyle} value={form.mother_name} onChange={e => handleChange('mother_name', e.target.value)} /></FormField>
              <div style={{ gridColumn: '1/-1' }}><FormField label="স্বামীর নাম"><input style={fieldStyle} value={form.husband_name} onChange={e => handleChange('husband_name', e.target.value)} /></FormField></div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <FormField label="পরিবারের সদস্য" icon={MdFamilyRestroom}><input type="number" style={fieldStyle} value={form.total_members} onChange={e => handleChange('total_members', e.target.value)} /></FormField>
              <FormField label="মোট সন্তান" icon={MdChildCare}><input type="number" style={fieldStyle} value={form.total_children} onChange={e => handleChange('total_children', e.target.value)} /></FormField>
              <FormField label="স্কুলে যায়" icon={MdSchool}><input type="number" style={fieldStyle} value={form.school_going} onChange={e => handleChange('school_going', e.target.value)} /></FormField>
              <FormField label="৫ বছরের নিচে" icon={MdChildCare}><input type="number" style={fieldStyle} value={form.under_five} onChange={e => handleChange('under_five', e.target.value)} /></FormField>
            </div>
          )}

          {step === 3 && (
            <div>
              <FormField label="লোনের পরিমাণ (৳)" icon={MdAttachMoney}><input type="number" style={fieldStyle} value={form.loan_amount} onChange={e => handleChange('loan_amount', e.target.value)} /></FormField>
              <FormField label="লোনের উদ্দেশ্য"><input style={fieldStyle} value={form.loan_purpose} onChange={e => handleChange('loan_purpose', e.target.value)} /></FormField>
              <FormField label="অতিরিক্ত নোট" icon={MdNotes}><textarea style={{ ...fieldStyle, minHeight: 80 }} value={form.notes} onChange={e => handleChange('notes', e.target.value)} /></FormField>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif" }}>পিছনে</button>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif" }}>বাতিল</button>
          )}
          
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Hind Siliguri', sans-serif" }}>
              পরবর্তী ধাপ <MdArrowForward />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Hind Siliguri', sans-serif" }}>
              <MdSave /> {submitting ? 'সেভ হচ্ছে...' : (editData ? 'আপডেট করুন' : 'আবেদন জমা দিন')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanFormModal
