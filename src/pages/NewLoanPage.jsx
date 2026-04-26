import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  MdArrowBack, MdPerson, MdHome, MdGroups, MdBadge, MdCalendarToday,
  MdCreditCard, MdFamilyRestroom, MdChildCare, MdSchool, MdCheck,
  MdHistory, MdAdd, MdClose, MdSave, MdArrowForward,
} from 'react-icons/md'

const CARD_TYPES = ['NID', 'জন্ম নিবন্ধন সনদ']

const initialForm = {
  // Member info
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
  // Family info
  total_members: '',
  total_children: '',
  school_going: '',
  under_five: '',
  // Loan info
  loan_amount: '',
  loan_purpose: '',
  notes: '',
}

const LoanHistoryCard = ({ loan, onClose }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1.5px solid #e0e7ff',
      marginBottom: 10, overflow: 'hidden', transition: 'box-shadow 0.2s',
      boxShadow: expanded ? '0 6px 20px rgba(79,70,229,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', cursor: 'pointer' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MdPerson style={{ color: '#4f46e5', fontSize: 22 }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif" }}>{loan.member_name}</p>
          <p style={{ fontSize: 11.5, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
            ভিও: {loan.vo_number} • সদস্য নং: {loan.member_number} • ৳ {(loan.loan_amount || 0).toLocaleString('bn-BD')}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>সম্পন্ন</span>
          <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: "'Hind Siliguri', sans-serif" }}>
            {new Date(loan.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 1rem 0.85rem 1rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {[
              { l: 'পিতার নাম', v: loan.father_name },
              { l: 'মাতার নাম', v: loan.mother_name },
              { l: 'স্বামীর নাম', v: loan.husband_name },
              { l: 'জন্ম তারিখ', v: loan.birth_date },
              { l: 'কার্ড টাইপ', v: loan.card_type },
              { l: 'আইডি নম্বর', v: loan.id_number },
              { l: 'ঠিকানা', v: loan.full_address },
              { l: 'মোট সদস্য', v: loan.total_members },
              { l: 'মোট সন্তান', v: loan.total_children },
              { l: 'স্কুলগামী', v: loan.school_going },
              { l: '৫ বছরের কম', v: loan.under_five },
              { l: 'লোনের উদ্দেশ্য', v: loan.loan_purpose },
            ].filter(i => i.v).map(({ l, v }) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 10px' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>{l}</p>
                <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif" }}>{v}</p>
              </div>
            ))}
          </div>
          {loan.notes && (
            <div style={{ background: '#fffbeb', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
              <p style={{ fontSize: 11, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif" }}><b>নোট:</b> {loan.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const NewLoanPage = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState('form') // 'form' | 'history'
  const [form, setForm] = useState(initialForm)
  const [voGroups, setVoGroups] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(false)
  const [step, setStep] = useState(1) // 1=personal, 2=family, 3=loan

  const fetchVOs = useCallback(async () => {
    const { data } = await supabase.from('vo_groups').select('*').order('vo_number')
    setVoGroups(data || [])
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistLoading(true)
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      toast.error('হিস্ট্রি লোড করতে ব্যর্থ')
      console.error(err)
    } finally {
      setHistLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVOs()
    if (tab === 'history') fetchHistory()
  }, [fetchVOs, fetchHistory, tab])

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.member_name.trim()) return toast.error('সদস্যের নাম দিন')
    if (!form.vo_number) return toast.error('ভিও নম্বর দিন')
    if (!form.member_number.trim()) return toast.error('সদস্য নম্বর দিন')
    setSubmitting(true)
    try {
      const { error } = await supabase.from('loan_applications').insert([{
        ...form,
        loan_amount: form.loan_amount ? parseFloat(form.loan_amount) : null,
        total_members: form.total_members ? parseInt(form.total_members) : null,
        total_children: form.total_children ? parseInt(form.total_children) : null,
        school_going: form.school_going ? parseInt(form.school_going) : null,
        under_five: form.under_five ? parseInt(form.under_five) : null,
        vo_number: parseInt(form.vo_number),
        status: 'completed',
      }])
      if (error) throw error
      toast.success('লোন আবেদন সফলভাবে সংরক্ষিত হয়েছে!')
      setForm(initialForm)
      setStep(1)
      setTab('history')
    } catch (err) {
      console.error(err)
      toast.error('সংরক্ষণ করতে ব্যর্থ হয়েছে')
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

  const stepInfo = [
    { num: 1, title: 'ব্যক্তিগত তথ্য', icon: MdPerson },
    { num: 2, title: 'পরিবারের তথ্য', icon: MdFamilyRestroom },
    { num: 3, title: 'লোনের বিবরণ', icon: MdBadge },
  ]

  return (
    <>
      <style>{`
        .loan-tab { padding: 9px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Hind Siliguri', sans-serif; }
        .loan-tab.active { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,0.3); }
        .loan-tab:not(.active) { background: #f1f5f9; color: #64748b; }
        .loan-tab:not(.active):hover { background: #e0e7ff; color: #4f46e5; }
        .step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; transition: all 0.3s; }
        .step-line { flex: 1; height: 2px; margin: 0 6px; border-radius: 2px; transition: background 0.3s; }
        input:focus, select:focus, textarea:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
      `}</style>

      <div className="page-enter">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          borderRadius: 20, padding: '1.25rem 1.4rem', marginBottom: '1.25rem',
          boxShadow: '0 8px 28px rgba(79,70,229,0.3)', position: 'relative', overflow: 'hidden',
          animation: 'slideUp 0.4s ease-out both',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <MdArrowBack style={{ fontSize: 20 }} />
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 2 }}>নতুন লোন</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                নতুন লোন আবেদন তথ্য প্রবেশ করুন
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', animation: 'slideUp 0.4s ease-out 0.1s both' }}>
          <button className={`loan-tab ${tab === 'form' ? 'active' : ''}`} onClick={() => setTab('form')}>
            <MdAdd style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 5 }} />
            নতুন আবেদন
          </button>
          <button className={`loan-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            <MdHistory style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 5 }} />
            হিস্ট্রি ({history.length})
          </button>
        </div>

        {tab === 'form' && (
          <div style={{ animation: 'slideUp 0.35s ease-out both' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem', background: '#fff', borderRadius: 14, padding: '0.85rem 1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {stepInfo.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div
                    onClick={() => setStep(s.num)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 4 }}
                  >
                    <div className="step-circle" style={{
                      background: step === s.num ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : step > s.num ? '#10b981' : '#f1f5f9',
                      color: step >= s.num ? '#fff' : '#94a3b8',
                    }}>
                      {step > s.num ? <MdCheck style={{ fontSize: 15 }} /> : <s.icon style={{ fontSize: 16 }} />}
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 600, color: step >= s.num ? '#4f46e5' : '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", whiteSpace: 'nowrap' }}>{s.title}</span>
                  </div>
                  {idx < stepInfo.length - 1 && (
                    <div className="step-line" style={{ background: step > s.num ? '#10b981' : '#e2e8f0' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Form body */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #e2e8f0', padding: '1.2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
              {step === 1 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MdPerson style={{ fontSize: 16 }} /> ব্যক্তিগত তথ্য
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <div style={{ gridColumn: '1/-1' }}>
                      <FormField label="সদস্যের নাম *" icon={MdPerson}>
                        <input style={fieldStyle} placeholder="সদস্যের পূর্ণ নাম" value={form.member_name} onChange={e => handleChange('member_name', e.target.value)} />
                      </FormField>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <FormField label="পূর্ণ ঠিকানা" icon={MdHome}>
                        <textarea style={{ ...fieldStyle, resize: 'none', minHeight: 70 }} placeholder="গ্রাম, পোস্ট অফিস, উপজেলা, জেলা" value={form.full_address} onChange={e => handleChange('full_address', e.target.value)} />
                      </FormField>
                    </div>
                    <FormField label="ভিও নম্বর *" icon={MdGroups}>
                      <select style={fieldStyle} value={form.vo_number} onChange={e => handleChange('vo_number', e.target.value)}>
                        <option value="">ভিও সিলেক্ট করুন</option>
                        {voGroups.map(v => (
                          <option key={v.id} value={v.vo_number}>VO-{v.vo_number} {v.vo_name ? `(${v.vo_name})` : ''}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="সদস্য নম্বর *" icon={MdBadge}>
                      <input style={fieldStyle} placeholder="সদস্য নম্বর" value={form.member_number} onChange={e => handleChange('member_number', e.target.value)} />
                    </FormField>
                    <FormField label="জন্ম তারিখ" icon={MdCalendarToday}>
                      <input type="date" style={fieldStyle} value={form.birth_date} onChange={e => handleChange('birth_date', e.target.value)} />
                    </FormField>
                    <FormField label="কার্ড টাইপ" icon={MdCreditCard}>
                      <select style={fieldStyle} value={form.card_type} onChange={e => handleChange('card_type', e.target.value)}>
                        {CARD_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormField>
                    <div style={{ gridColumn: '1/-1' }}>
                      <FormField label="আইডি নম্বর (NID / জন্ম নিবন্ধন)" icon={MdCreditCard}>
                        <input style={fieldStyle} placeholder="আইডি নম্বর দিন" value={form.id_number} onChange={e => handleChange('id_number', e.target.value)} />
                      </FormField>
                    </div>
                    <FormField label="পিতার নাম">
                      <input style={fieldStyle} placeholder="পিতার নাম" value={form.father_name} onChange={e => handleChange('father_name', e.target.value)} />
                    </FormField>
                    <FormField label="মাতার নাম">
                      <input style={fieldStyle} placeholder="মাতার নাম" value={form.mother_name} onChange={e => handleChange('mother_name', e.target.value)} />
                    </FormField>
                    <div style={{ gridColumn: '1/-1' }}>
                      <FormField label="স্বামীর নাম">
                        <input style={fieldStyle} placeholder="স্বামীর নাম (প্রযোজ্য হলে)" value={form.husband_name} onChange={e => handleChange('husband_name', e.target.value)} />
                      </FormField>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MdFamilyRestroom style={{ fontSize: 16 }} /> পরিবারের তথ্য
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    {[
                      { key: 'total_members', label: 'মোট পরিবারের সদস্য', icon: MdFamilyRestroom, placeholder: 'যেমন: ৫' },
                      { key: 'total_children', label: 'মোট সন্তান', icon: MdChildCare, placeholder: 'যেমন: ২' },
                      { key: 'school_going', label: 'স্কুলে যায় কতজন', icon: MdSchool, placeholder: 'যেমন: ২' },
                      { key: 'under_five', label: '৫ বছরের কম বয়সী', icon: MdChildCare, placeholder: 'যেমন: ১' },
                    ].map(({ key, label, icon: Icon, placeholder }) => (
                      <FormField key={key} label={label} icon={Icon}>
                        <input type="number" min="0" style={fieldStyle} placeholder={placeholder} value={form[key]} onChange={e => handleChange(key, e.target.value)} />
                      </FormField>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MdBadge style={{ fontSize: 16 }} /> লোনের বিবরণ
                  </p>
                  <FormField label="লোনের পরিমাণ (টাকা)">
                    <input type="number" min="0" style={fieldStyle} placeholder="যেমন: ১০০০০" value={form.loan_amount} onChange={e => handleChange('loan_amount', e.target.value)} />
                  </FormField>
                  <FormField label="লোনের উদ্দেশ্য">
                    <input style={fieldStyle} placeholder="ব্যবসা, কৃষি, গৃহনির্মাণ..." value={form.loan_purpose} onChange={e => handleChange('loan_purpose', e.target.value)} />
                  </FormField>
                  <FormField label="অতিরিক্ত নোট">
                    <textarea style={{ ...fieldStyle, resize: 'none', minHeight: 80 }} placeholder="যে কোনো অতিরিক্ত তথ্য..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
                  </FormField>
                </>
              )}
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: step === 1 ? 'flex-end' : 'space-between' }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ padding: '11px 24px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif', display: 'flex', alignItems: 'center', gap: 6" }}>
                  ← পিছনে
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)}
                  style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                  পরবর্তী <MdArrowForward style={{ fontSize: 16 }} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
                  <MdCheck style={{ fontSize: 18 }} />
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সম্পন্ন করুন ও সেভ করুন'}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ animation: 'slideUp 0.35s ease-out both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট {history.length} টি লোন আবেদন
              </p>
              <button onClick={fetchHistory} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569', fontFamily: "'Hind Siliguri', sans-serif" }}>
                🔄 রিফ্রেশ
              </button>
            </div>
            {histLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>লোড হচ্ছে...</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <MdHistory style={{ fontSize: 50, color: '#c7d2fe', marginBottom: 12 }} />
                <p style={{ color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14 }}>কোনো হিস্ট্রি পাওয়া যায়নি</p>
              </div>
            ) : history.map(loan => <LoanHistoryCard key={loan.id} loan={loan} />)}
          </div>
        )}
      </div>
    </>
  )
}

export default NewLoanPage
