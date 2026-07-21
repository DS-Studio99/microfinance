import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  MdArrowBack, MdPerson, MdGroups, MdCheckCircle, MdPendingActions,
  MdHistory, MdAdd, MdDelete, MdEdit, MdAttachMoney, MdArrowForward,
  MdKeyboardArrowDown, MdKeyboardArrowUp, MdPhone, MdLocationOn, MdInfo, MdClose, MdWarning
} from 'react-icons/md'
import LoanFormModal from '../components/LoanFormModal'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor, loading }) => {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 400, borderRadius: '24px 24px 0 0', padding: '1.5rem', animation: 'slideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: confirmColor === 'red' ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: `2px solid ${confirmColor === 'red' ? '#fca5a5' : '#86efac'}` }}>
            {confirmColor === 'red' ? <MdWarning style={{ fontSize: 30, color: '#ef4444' }} /> : <MdCheckCircle style={{ fontSize: 30, color: '#16a34a' }} />}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: '0 0 8px' }}>{title}</h3>
          <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", margin: '0 0 1.5rem', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif" }}>বাতিল</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: confirmColor === 'red' ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {loading ? 'প্রসেস হচ্ছে...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

const LoanCard = ({ loan, onEdit, onDelete, onComplete }) => {
  const [expanded, setExpanded] = useState(false)
  const isPending = loan.status === 'pending'
  const date = new Date(loan.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icon && <Icon style={{ fontSize: 11 }} />} {label}
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>{value || '--'}</p>
    </div>
  )

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
      padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s ease',
    }}>
      <div 
        onClick={() => setExpanded(!expanded)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
              {loan.member_name}
            </h3>
            {loan.application_type === 'savings' ? (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 6, fontFamily: "'Hind Siliguri', sans-serif" }}>সঞ্চয় উত্তোলন</span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: 6, fontFamily: "'Hind Siliguri', sans-serif" }}>লোন</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
            সদস্য নং: #{loan.member_number} &nbsp;•&nbsp; <strong style={{color: '#4f46e5'}}>ভিও - {String(loan.vo_number).padStart(2,'0')}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <div style={{ background: isPending ? '#fef3c7' : '#dcfce7', color: isPending ? '#b45309' : '#166534', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>
            {date}
          </div>
          {expanded ? <MdKeyboardArrowUp style={{ color: '#94a3b8' }} /> : <MdKeyboardArrowDown style={{ color: '#94a3b8' }} />}
        </div>
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>লোনের পরিমাণ</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
            ৳ {(loan.loan_amount || 0).toLocaleString('bn-BD')}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>মোবাইল নম্বর</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {loan.phone_number || 'নেই'}
          </p>
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, animation: 'fadeIn 0.3s ease' }}>
          {loan.application_type === 'savings' ? (
            <div style={{ gridColumn: '1 / -1' }}><DetailItem label="প্রদানের তারিখ" value={loan.disbursement_date} icon={MdCalendarToday} /></div>
          ) : (
            <>
              <div style={{ gridColumn: '1 / -1' }}><DetailItem label="ঠিকানা" value={loan.full_address} icon={MdLocationOn} /></div>
              <DetailItem label="পিতার নাম" value={loan.father_name} />
              <DetailItem label="মাতার নাম" value={loan.mother_name} />
              <DetailItem label="স্বামীর নাম" value={loan.husband_name} />
              <DetailItem label="কার্ড টাইপ" value={loan.card_type} />
              <DetailItem label="আইডি নম্বর" value={loan.id_number} />
              <DetailItem label="জন্ম তারিখ" value={loan.birth_date} />
              <DetailItem label="পরিবারের সদস্য" value={loan.total_members} />
              <DetailItem label="মোট সন্তান" value={loan.total_children} />
              <DetailItem label="স্কুলে যায়" value={loan.school_going} />
              <DetailItem label="৫ বছরের নিচে" value={loan.under_five} />
              <DetailItem label="প্রদানের তারিখ" value={loan.disbursement_date} icon={MdCalendarToday} />
              <div style={{ gridColumn: '1 / -1' }}><DetailItem label="লোনের উদ্দেশ্য" value={loan.loan_purpose} icon={MdInfo} /></div>
            </>
          )}
          {loan.notes && <div style={{ gridColumn: '1 / -1' }}><DetailItem label="অতিরিক্ত নোট" value={loan.notes} /></div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: expanded ? '1px solid #f1f5f9' : 'none' }}>
        {isPending && (
          <button 
            onClick={() => onComplete(loan)}
            style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem', fontSize: 13, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <MdCheckCircle style={{ fontSize: 16 }} /> কমপ্লিট করুন
          </button>
        )}
        <button 
          onClick={() => onEdit(loan)}
          style={{ width: 42, height: 42, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="এডিট"
        >
          <MdEdit style={{ fontSize: 18 }} />
        </button>
        <button 
          onClick={() => onDelete(loan)}
          style={{ width: 42, height: 42, background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="মুছে ফেলুন"
        >
          <MdDelete style={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  )
}

const NewLoanPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [loans, setLoans] = useState([])
  const [voGroups, setVoGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editLoan, setEditLoan] = useState(null)
  
  // Confirmation state
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmComplete, setConfirmComplete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setLoans(data || [])
    } catch (err) {
      toast.error('তথ্য লোড করতে ব্যর্থ')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVOs = useCallback(async () => {
    const { data } = await supabase.from('vo_groups').select('*').order('vo_number')
    setVoGroups((data || []).filter(v => !v.is_disabled))
  }, [])

  useEffect(() => {
    fetchLoans()
    fetchVOs()
  }, [fetchLoans, fetchVOs])

  const pendingLoans = loans.filter(l => l.status === 'pending')
  const completedLoans = loans.filter(l => l.status === 'completed')
  const activeData = activeTab === 'pending' ? pendingLoans : completedLoans

  const handleAddOrUpdate = async (formData) => {
    try {
      if (editLoan) {
        const { error } = await supabase
          .from('loan_applications')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editLoan.id)
        if (error) throw error
        toast.success('আবেদন আপডেট করা হয়েছে')
      } else {
        const { error } = await supabase
          .from('loan_applications')
          .insert([formData])
        if (error) throw error
        toast.success('নতুন আবেদন জমা হয়েছে')
      }
      fetchLoans()
      return true
    } catch (err) {
      console.error('Save error:', err)
      toast.error(`ব্যর্থ হয়েছে: ${err.message || 'Unknown error'}`)
      return false
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from('loan_applications').delete().eq('id', confirmDelete.id)
      if (error) throw error
      toast.success('আবেদনটি মুছে ফেলা হয়েছে')
      setConfirmDelete(null)
      fetchLoans()
    } catch (err) {
      toast.error('মুছে ফেলতে ব্যর্থ')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!confirmComplete) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', confirmComplete.id)
      if (error) throw error
      toast.success('আবেদনটি কমপ্লিট হিস্ট্রিতে পাঠানো হয়েছে')
      setConfirmComplete(null)
      fetchLoans()
    } catch (err) {
      toast.error('আপডেট ব্যর্থ')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <MdArrowBack style={{ fontSize: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>লোন আবেদনসমূহ</h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>নতুন লোন আবেদন ও হিস্ট্রি</p>
          </div>
        </div>
        <button onClick={() => { setEditLoan(null); setShowModal(true) }} className="btn-primary" style={{ padding: '0.65rem 1.1rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          <MdAdd style={{ fontSize: 20 }} /> নতুন আবেদন
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', padding: '1rem', borderRadius: 16, border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdPendingActions style={{ color: '#b45309' }} /></div>
          <div><p style={{ fontSize: 10, color: '#92400e', margin: 0, fontFamily: "'Hind Siliguri', sans-serif" }}>অপেক্ষমাণ</p><p style={{ fontSize: 20, fontWeight: 800, color: '#92400e', margin: 0 }}>{pendingLoans.length}</p></div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', padding: '1rem', borderRadius: 16, border: '1.5px solid #86efac', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdCheckCircle style={{ color: '#166534' }} /></div>
          <div><p style={{ fontSize: 10, color: '#166534', margin: 0, fontFamily: "'Hind Siliguri', sans-serif" }}>কমপ্লিট</p><p style={{ fontSize: 20, fontWeight: 800, color: '#166534', margin: 0 }}>{completedLoans.length}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: 4, borderRadius: 14 }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === 'pending' ? '#fff' : 'transparent',
            color: activeTab === 'pending' ? '#4f46e5' : '#64748b',
            fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14,
            boxShadow: activeTab === 'pending' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
          }}
        >
          <MdPendingActions style={{ fontSize: 18 }} /> পেন্ডিং ({pendingLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === 'completed' ? '#fff' : 'transparent',
            color: activeTab === 'completed' ? '#10b981' : '#64748b',
            fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14,
            boxShadow: activeTab === 'completed' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
          }}
        >
          <MdHistory style={{ fontSize: 18 }} /> কমপ্লিট হিস্ট্রি
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
        </div>
      ) : activeData.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 20, padding: '4rem 2rem', textAlign: 'center', border: '1.5px dashed #e2e8f0' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <MdPendingActions style={{ fontSize: 32, color: '#cbd5e1' }} />
          </div>
          <h3 style={{ fontSize: 16, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700, margin: 0 }}>কোনো আবেদন নেই</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 6 }}>
            {activeTab === 'pending' ? 'এই মুহূর্তে কোনো অপেক্ষমাণ লোন আবেদন নেই' : 'কোনো কমপ্লিট হওয়া লোনের হিস্ট্রি নেই'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {activeData.map(l => (
            <LoanCard 
              key={l.id} loan={l} 
              onEdit={(data) => { setEditLoan(data); setShowModal(true) }}
              onDelete={setConfirmDelete}
              onComplete={setConfirmComplete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <LoanFormModal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setEditLoan(null) }} 
        onSubmit={handleAddOrUpdate}
        editData={editLoan}
        voGroups={voGroups}
      />

      <ConfirmModal 
        isOpen={!!confirmDelete} 
        onClose={() => setConfirmDelete(null)} 
        onConfirm={handleDelete}
        title="আবেদন মুছে ফেলুন"
        message={`আপনি কি নিশ্চিত যে "${confirmDelete?.member_name}"-এর লোন আবেদনটি মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, মুছুন"
        confirmColor="red"
        loading={actionLoading}
      />

      <ConfirmModal 
        isOpen={!!confirmComplete} 
        onClose={() => setConfirmComplete(null)} 
        onConfirm={handleComplete}
        title="আবেদন সম্পন্ন করুন"
        message={`"${confirmComplete?.member_name}"-এর লোন আবেদনটি কি কমপ্লিট হিস্ট্রিতে পাঠাতে চান?`}
        confirmText="হ্যাঁ, সম্পন্ন করুন"
        confirmColor="green"
        loading={actionLoading}
      />
    </div>
  )
}

export default NewLoanPage
