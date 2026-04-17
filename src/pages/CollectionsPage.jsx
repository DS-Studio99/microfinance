import React, { useState } from 'react'
import { MdAdd, MdCheckCircle, MdPendingActions, MdPerson, MdAttachMoney, MdPhone, MdDelete, MdHistory } from 'react-icons/md'
import { useCollections } from '../hooks/useCollections'
import { useVOGroups } from '../hooks/useVOGroups'
import CollectionFormModal from '../components/CollectionFormModal'

const CollectionCard = ({ data, onComplete, onDelete }) => {
  const m = data.members || {}
  const isPending = data.status === 'pending'
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', 
      padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
            {m.full_name || 'নাম নেই'}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
            সদস্য নং: #{m.member_number || '--'} &nbsp;•&nbsp; <strong style={{color: '#4f46e5'}}>ভিও - {String(m.vo_number || data.vo_number).padStart(2,'0')}</strong>
          </p>
        </div>
        <div style={{ background: isPending ? '#fef3c7' : '#dcfce7', color: isPending ? '#b45309' : '#166534', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>
          {new Date(data.transaction_date).toLocaleDateString('bn-BD')}
        </div>
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>আগের সঞ্চয় / বর্তমান জমা</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {data.prev_savings} ৳ <span style={{ color: '#059669' }}>+ {data.current_savings} ৳</span>
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>আগের কিস্তি / বর্তমান কিস্তি</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {data.prev_installment} ৳ <span style={{ color: '#2563eb' }}>+ {data.current_installment} ৳</span>
          </p>
        </div>
      </div>

      {data.bkash_number && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MdPhone style={{ color: '#e11d48', fontSize: 14 }} />
          <span style={{ fontSize: 13, color: '#be123c', fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif" }}>
            বিকাশ: {data.bkash_number}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
        {isPending && (
          <button 
            onClick={() => onComplete(data.id)}
            style={{ flex: 1, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem', fontSize: 13, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <MdCheckCircle style={{ fontSize: 16 }} /> পোস্টিং সাবমিট
          </button>
        )}
        <button 
          onClick={() => { if(window.confirm('মুছে ফেলতে চান?')) onDelete(data.id) }}
          style={{ width: isPending ? 'auto' : '100%', padding: '0.6rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MdDelete style={{ fontSize: 16 }} /> {isPending ? '' : 'মুছে ফেলুন'}
        </button>
      </div>
    </div>
  )
}

const CollectionsPage = () => {
  const { pendingCollections, completedCollections, loading, fetchCollections, addCollection, markAsCompleted, deleteCollection } = useCollections()
  const { voGroups } = useVOGroups()
  const [activeTab, setActiveTab] = useState('pending')
  const [showAdd, setShowAdd] = useState(false)

  const activeData = activeTab === 'pending' ? pendingCollections : completedCollections

  return (
    <>
      <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>পোস্টিং ও কালেকশন</h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>অপেক্ষমাণ কালেকশন এবং পোস্টিং হিস্ট্রি</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
            <MdAdd style={{ fontSize: 18 }} /> নতুন এন্ট্রি
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: 4, borderRadius: 12 }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === 'pending' ? '#fff' : 'transparent',
              color: activeTab === 'pending' ? '#d97706' : '#64748b',
              fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14,
              boxShadow: activeTab === 'pending' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <MdPendingActions style={{ fontSize: 18 }} />
            পেন্ডিং ({pendingCollections.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === 'completed' ? '#fff' : 'transparent',
              color: activeTab === 'completed' ? '#16a34a' : '#64748b',
              fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14,
              boxShadow: activeTab === 'completed' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <MdHistory style={{ fontSize: 18 }} />
            কমপ্লিট হিস্ট্রি
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
          </div>
        ) : activeData.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <MdPendingActions style={{ fontSize: 48, color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: 16, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700 }}>
              কোনো ডাটা নেই
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>
              {activeTab === 'pending' ? 'এই মুহূর্তে কোনো অপেক্ষমাণ কালেকশন নেই' : 'কোনো কমপ্লিট হওয়া পোস্টিং হিস্ট্রি নেই'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {activeData.map(c => (
              <CollectionCard 
                key={c.id} data={c} 
                onComplete={markAsCompleted} 
                onDelete={deleteCollection} 
              />
            ))}
          </div>
        )}

      </div>

      <CollectionFormModal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        voGroups={voGroups}
        onSubmit={async (data) => {
          const res = await addCollection(data)
          return res
        }}
      />
    </>
  )
}

export default CollectionsPage
