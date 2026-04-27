import React, { useState, useEffect } from 'react'
import { MdClose, MdSave, MdPerson } from 'react-icons/md'

const CollectionFormModal = ({ isOpen, onClose, onSubmit, voGroups }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    vo_number: '',
    transaction_date: new Date().toISOString().split('T')[0],
    prev_savings: '',
    current_savings: '',
    prev_installment: '',
    current_installment: '',
    bkash_number: '',
    khata_written: 'না'
  })
  
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const isSubmitting = false

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        member_id: '',
        vo_number: '',
        transaction_date: new Date().toISOString().split('T')[0],
        prev_savings: '',
        current_savings: '',
        prev_installment: '',
        current_installment: '',
        bkash_number: '',
        khata_written: 'না'
      })
      setMembers([])
    }
  }, [isOpen])

  // Fetch members when VO changes
  useEffect(() => {
    if (formData.vo_number) {
      const fetchVOMembers = async () => {
        setLoadingMembers(true)
        try {
          const { supabase } = await import('../lib/supabase')
          const { data } = await supabase
            .from('members')
            .select('id, full_name, member_number')
            .eq('vo_number', formData.vo_number)
            .order('full_name')
          setMembers(data || [])
        } catch (err) {
          console.error(err)
        } finally {
          setLoadingMembers(false)
        }
      }
      fetchVOMembers()
    } else {
      setMembers([])
    }
  }, [formData.vo_number])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.member_id) return
    const payload = {
      member_id: formData.member_id,
      transaction_date: formData.transaction_date,
      prev_savings: formData.prev_savings ? parseFloat(formData.prev_savings) : 0,
      current_savings: formData.current_savings ? parseFloat(formData.current_savings) : 0,
      prev_installment: formData.prev_installment ? parseFloat(formData.prev_installment) : 0,
      current_installment: formData.current_installment ? parseFloat(formData.current_installment) : 0,
      bkash_number: formData.bkash_number || null,
      khata_written: formData.khata_written === 'হ্যা',
    }
    const { error } = await onSubmit(payload)
    if (!error) onClose()
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>
            নতুন কালেকশন এন্ট্রি
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <MdClose style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <form id="collection-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">ভিও নম্বর নির্বাচন করুন *</label>
                <select name="vo_number" value={formData.vo_number} onChange={handleChange} className="field-input" required>
                  <option value="">বাছাই করুন</option>
                  {(voGroups || []).map(vo => (
                    <option key={vo.id} value={vo.vo_number}>ভিও - {String(vo.vo_number).padStart(2, '0')} {vo.vo_name ? `(${vo.vo_name})` : ''}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">সদস্য নির্বাচন করুন *</label>
                <select name="member_id" value={formData.member_id} onChange={handleChange} className="field-input" required disabled={!formData.vo_number || loadingMembers}>
                  <option value="">{loadingMembers ? 'লোড হচ্ছে...' : 'বাছাই করুন'}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} {m.member_number ? `(#${m.member_number})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">টাকা জমার তারিখ *</label>
              <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className="field-input" required />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">আগের মোট সঞ্চয়</label>
                <input type="number" step="0.01" name="prev_savings" value={formData.prev_savings} onChange={handleChange} className="field-input" placeholder="০.০০" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">বর্তমান জমার সঞ্চয়</label>
                <input type="number" step="0.01" name="current_savings" value={formData.current_savings} onChange={handleChange} className="field-input" placeholder="০.০০" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">আগের মোট কিস্তি</label>
                <input type="number" step="0.01" name="prev_installment" value={formData.prev_installment} onChange={handleChange} className="field-input" placeholder="০.০০" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">বর্তমান জমার কিস্তি</label>
                <input type="number" step="0.01" name="current_installment" value={formData.current_installment} onChange={handleChange} className="field-input" placeholder="০.০০" />
              </div>
            </div>

            <div>
              <label className="field-label">বিকাশ / অন্যান্য মোবাইল নম্বর (যদি থাকে)</label>
              <input type="text" name="bkash_number" value={formData.bkash_number} onChange={handleChange} className="field-input" placeholder="যেমন: ০১৭..." />
            </div>

            <div>
              <label className="field-label">খাতা লেখা হয়েছে? *</label>
              <select
                name="khata_written"
                value={formData.khata_written}
                onChange={handleChange}
                className="field-input"
                required
                style={{
                  color: formData.khata_written === 'হ্যা' ? '#15803d' : '#b45309',
                  fontWeight: 700,
                  fontFamily: "'Hind Siliguri', sans-serif"
                }}
              >
                <option value="না" style={{ color: '#b45309' }}>না — খাতা লেখা হয়নি</option>
                <option value="হ্যা" style={{ color: '#15803d' }}>হ্যা — খাতা লেখা হয়েছে</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f8fafc', padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'flex-end', gap: 10
        }}>
          <button type="button" onClick={onClose} className="btn-ghost">
            বাতিল
          </button>
          <button type="submit" form="collection-form" className="btn-primary" disabled={isSubmitting}>
            <MdSave style={{ fontSize: 18 }} />
            সেভ করুন
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollectionFormModal
