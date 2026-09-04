import React, { useState, useEffect } from 'react'
import {
  MdClose, MdPerson, MdGroups, MdBadge,
  MdCheck, MdArrowForward, MdSave, MdAttachMoney, MdNotes, MdEvent, MdInfo
} from 'react-icons/md'
import { useMembers } from '../hooks/useMembers'

const initialForm = {
  application_type: 'loan', // 'loan' or 'savings'
  member_name: '',
  vo_number: '',
  member_number: '',
  phone_number: '',
  loan_amount: '',
  loan_purpose: '',
  disbursement_date: '',
  notes: '',
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

  // Fetch members for selected VO
  const { members } = useMembers(form.vo_number ? parseInt(form.vo_number) : null)

  useEffect(() => {
    if (editData) {
      setForm({
        ...initialForm,
        ...editData,
        application_type: editData.application_type || 'loan',
        loan_amount: editData.loan_amount?.toString() || '',
      })
    } else {
      setForm(initialForm)
    }
    setStep(1)
  }, [editData, isOpen])

  if (!isOpen) return null

  const handleChange = (key, val) => {
    setForm(f => {
      const newForm = { ...f, [key]: val }
      if (key === 'vo_number') {
        newForm.member_name = ''
        newForm.member_number = ''
        newForm.phone_number = ''
      }
      return newForm
    })
  }

  const handleMemberSelect = (memberId) => {
    if (!memberId) {
      setForm(f => ({ ...f, member_name: '', member_number: '', phone_number: '' }))
      return
    }
    const member = members.find(m => m.id.toString() === memberId)
    if (member) {
      setForm(f => ({
        ...f,
        member_name: member.member_name || member.full_name || '',
        member_number: member.member_number || '',
        phone_number: member.phone_number || ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vo_number) return alert('ভিও নম্বর দিন')
    if (!form.member_name || !form.member_name.trim()) return alert('সদস্যের নাম দিন')
    if (!form.loan_amount) return alert('টাকার পরিমাণ দিন')
    
    setSubmitting(true)
    try {
      const success = await onSubmit({
        ...form,
        loan_amount: form.loan_amount ? parseFloat(form.loan_amount) : null,
        vo_number: parseInt(form.vo_number),
        disbursement_date: form.disbursement_date || null
      })
      if (success) onClose()
    } catch (err) {
      console.error(err)
      alert('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
    fontFamily: "'Hind Siliguri', sans-serif", transition: 'border-color 0.2s',
    boxSizing: 'border-box', background: '#fff', color: '#0f172a',
  }

  const isLoan = form.application_type === 'loan'

  const stepInfo = isLoan 
    ? [
        { num: 1, title: 'ব্যক্তিগত', icon: MdPerson },
        { num: 2, title: 'লোন', icon: MdAttachMoney },
      ]
    : [
        { num: 1, title: 'ব্যক্তিগত', icon: MdPerson },
        { num: 2, title: 'উত্তোলন', icon: MdAttachMoney },
      ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease-out', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '24px 24px 0 0' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
              {editData ? 'আবেদন সংশোধন' : 'নতুন আবেদন'}
            </h2>
            <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", margin: '2px 0 0 0' }}>ধাপ {step} / {stepInfo.length}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <MdClose style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Type Selector (Only on Step 1 and if not editing) */}
          {step === 1 && !editData && (
            <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', background: '#f8fafc', padding: 6, borderRadius: 12 }}>
              <button 
                type="button"
                onClick={() => handleChange('application_type', 'loan')}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: isLoan ? '#4f46e5' : 'transparent', color: isLoan ? '#fff' : '#64748b', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', transition: 'all 0.2s', boxShadow: isLoan ? '0 2px 4px rgba(79,70,229,0.2)' : 'none' }}
              >
                লোন আবেদন
              </button>
              <button 
                type="button"
                onClick={() => handleChange('application_type', 'savings')}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: !isLoan ? '#10b981' : 'transparent', color: !isLoan ? '#fff' : '#64748b', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', transition: 'all 0.2s', boxShadow: !isLoan ? '0 2px 4px rgba(16,185,129,0.2)' : 'none' }}
              >
                সঞ্চয় উত্তোলন
              </button>
            </div>
          )}

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
            {stepInfo.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: step === s.num ? (isLoan ? '#4f46e5' : '#10b981') : step > s.num ? (isLoan ? '#4f46e5' : '#10b981') : '#f1f5f9', color: step >= s.num ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, boxShadow: step === s.num ? `0 0 0 3px ${isLoan ? '#e0e7ff' : '#d1fae5'}` : 'none', transition: 'all 0.2s' }}>
                    {step > s.num ? <MdCheck style={{ fontSize: 18 }} /> : s.num}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: step >= s.num ? '#1e293b' : '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>{s.title}</span>
                </div>
                {idx < stepInfo.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.num ? (isLoan ? '#4f46e5' : '#10b981') : '#f1f5f9', margin: '0 10px', marginBottom: 20 }} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <FormField label="ভিও নম্বর *" icon={MdGroups}>
                <select style={fieldStyle} value={form.vo_number} onChange={e => handleChange('vo_number', e.target.value)}>
                  <option value="">সিলেক্ট</option>
                  {voGroups.map(v => <option key={v.id} value={v.vo_number}>VO-{v.vo_number}</option>)}
                </select>
              </FormField>

              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="সদস্য নির্বাচন করুন" icon={MdPerson}>
                  <select 
                    style={fieldStyle} 
                    onChange={e => handleMemberSelect(e.target.value)} 
                    disabled={!form.vo_number}
                    value={members.find(m => m.member_number === form.member_number)?.id || ''}
                  >
                    <option value="">{form.vo_number ? 'তালিকা থেকে সদস্য নির্বাচন করুন (ঐচ্ছিক)' : 'প্রথমে ভিও নির্বাচন করুন'}</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.member_name || m.full_name} (নং: {m.member_number})</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="সদস্য নম্বর *" icon={MdBadge}>
                <input style={fieldStyle} placeholder="সদস্য নং" value={form.member_number} onChange={e => handleChange('member_number', e.target.value)} />
              </FormField>

              <FormField label="মোবাইল নম্বর" icon={MdPerson}>
                <input style={fieldStyle} placeholder="০১XXXXXXXXX" value={form.phone_number} onChange={e => handleChange('phone_number', e.target.value)} />
              </FormField>

              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="সদস্যের নাম *" icon={MdPerson}>
                  <input style={fieldStyle} placeholder="সদস্যের নাম লিখুন" value={form.member_name} onChange={e => handleChange('member_name', e.target.value)} />
                </FormField>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <FormField label={isLoan ? "লোনের পরিমাণ (৳) *" : "উত্তোলনের পরিমাণ (৳) *"} icon={MdAttachMoney}>
                <input type="number" style={fieldStyle} value={form.loan_amount} onChange={e => handleChange('loan_amount', e.target.value)} />
              </FormField>
              <FormField label="প্রদানের তারিখ" icon={MdEvent}>
                <input type="date" style={fieldStyle} value={form.disbursement_date || ''} onChange={e => handleChange('disbursement_date', e.target.value)} />
              </FormField>
              {isLoan && (
                <FormField label="লোনের উদ্দেশ্য" icon={MdInfo}>
                  <input style={fieldStyle} placeholder="যেমন: ব্যবসা, কৃষি ইত্যাদি" value={form.loan_purpose} onChange={e => handleChange('loan_purpose', e.target.value)} />
                </FormField>
              )}
              <FormField label="অতিরিক্ত নোট" icon={MdNotes}>
                <textarea style={{ ...fieldStyle, minHeight: 80 }} placeholder="নোট লিখুন..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
              </FormField>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, borderRadius: '0 0 24px 24px' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif", transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>পিছনে</button>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif", transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>বাতিল</button>
          )}
          
          {step < stepInfo.length ? (
            <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: isLoan ? '#4f46e5' : '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Hind Siliguri', sans-serif", transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
              পরবর্তী ধাপ <MdArrowForward />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Hind Siliguri', sans-serif", transition: 'opacity 0.2s' }} onMouseEnter={e => !submitting && (e.currentTarget.style.opacity = 0.9)} onMouseLeave={e => !submitting && (e.currentTarget.style.opacity = 1)}>
              <MdSave /> {submitting ? 'সেভ হচ্ছে...' : (editData ? 'আপডেট করুন' : 'আবেদন জমা দিন')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanFormModal

