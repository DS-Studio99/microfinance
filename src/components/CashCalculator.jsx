import React, { useState, useMemo, useEffect } from 'react'
import { MdCalculate, MdRestartAlt, MdOutlinePayments, MdSave, MdDeleteOutline } from 'react-icons/md'

const denominations = [
  { value: 1000, label: '১০০০ টাকা' },
  { value: 500, label: '৫০০ টাকা' },
  { value: 200, label: '২০০ টাকা' },
  { value: 100, label: '১০০ টাকা' },
  { value: 50, label: '৫০ টাকা' },
  { value: 20, label: '২০ টাকা' },
  { value: 10, label: '১০ টাকা' },
  { value: 5, label: '৫ টাকা' },
]

const CashCalculator = () => {
  const [counts, setCounts] = useState(() => {
    const saved = localStorage.getItem('taka_calculator_counts')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return denominations.reduce((acc, curr) => ({ ...acc, [curr.value]: '' }), {})
  })

  const totals = useMemo(() => {
    let grandTotal = 0
    const details = denominations.map(d => {
      const count = parseInt(counts[d.value]) || 0
      const total = count * d.value
      grandTotal += total
      return { ...d, count, total }
    })
    return { details, grandTotal }
  }, [counts])

  const handleReset = () => {
    setCounts(denominations.reduce((acc, curr) => ({ ...acc, [curr.value]: '' }), {}))
  }

  const handleSave = () => {
    localStorage.setItem('taka_calculator_counts', JSON.stringify(counts))
    alert('হিসাব সেইভ করা হয়েছে!')
  }

  const handleDelete = () => {
    localStorage.removeItem('taka_calculator_counts')
    handleReset()
    alert('সেইভ করা হিসাব ডিলিট করা হয়েছে!')
  }

  const formatBn = (num) => new Intl.NumberFormat('bn-BD').format(num)

  return (
    <div className="surface" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdCalculate style={{ color: '#d97706', fontSize: 18 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>টাকা ক্যালকুলেটর</h3>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleSave}
            title="সেইভ করুন"
            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <MdSave style={{ fontSize: 16 }} /> সেইভ
          </button>
          <button 
            onClick={handleDelete}
            title="ডিলিট করুন"
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <MdDeleteOutline style={{ fontSize: 16 }} /> ডিলিট
          </button>
          <button 
            onClick={handleReset}
            title="মুছে ফেলুন"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <MdRestartAlt style={{ fontSize: 16 }} /> রিসেট
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {totals.details.map(d => (
          <div key={d.value} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '6px 10px', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', minWidth: 70, fontFamily: "'Hind Siliguri', sans-serif" }}>{d.label}</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>×</span>
            <input 
              type="number"
              min="0"
              value={counts[d.value]}
              onChange={e => setCounts(prev => ({ ...prev, [d.value]: e.target.value }))}
              placeholder="০"
              style={{
                width: 60, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', fontSize: 14, fontWeight: 700, textAlign: 'center', color: '#4f46e5', outline: 'none', background: counts[d.value] ? '#f5f3ff' : '#fff', borderColor: counts[d.value] ? '#c7d2fe' : '#e2e8f0', transition: 'all 0.2s'
              }}
            />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>=</span>
            <span style={{ flex: 1, textAlign: 'right', fontSize: 14, fontWeight: 700, color: d.total > 0 ? '#0f172a' : '#cbd5e1', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {formatBn(d.total)} ৳
            </span>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '1.25rem', padding: '1rem', borderRadius: 16, 
        background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
        color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 10px 20px rgba(15,23,42,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdOutlinePayments style={{ color: '#fbbf24', fontSize: 24 }} />
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif" }}>মোট টাকা</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>{formatBn(totals.grandTotal)}</span>
          <span style={{ fontSize: 14, marginLeft: 4, opacity: 0.8, fontWeight: 700 }}>৳</span>
        </div>
      </div>
    </div>
  )
}

export default CashCalculator

