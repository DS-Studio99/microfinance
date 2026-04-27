import React, { useState } from 'react'
import { MdBook, MdBookmarkAdd, MdPerson, MdPhone, MdCheckCircle, MdGroups, MdArrowBack } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useCollections } from '../hooks/useCollections'

const UnwrittenKhataPage = () => {
  const navigate = useNavigate()
  const { unwrittenKhata, unwrittenKhataByVO, unwrittenKhataCount, loading, updateKhataStatus } = useCollections()
  const [expandedVO, setExpandedVO] = useState(null)

  const voNumbers = Object.keys(unwrittenKhataByVO).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: '0.55rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#475569', fontWeight: 600, fontSize: 13 }}
        >
          <MdArrowBack style={{ fontSize: 18 }} /> ফিরে যান
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
            খাতা লেখা হয়নি এমন সদস্য
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
            টাকা দিয়েছেন কিন্তু খাতায় এন্ট্রি হয়নি
          </p>
        </div>
        {/* Summary badge */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: 14, padding: '0.5rem 1rem',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
        }}>
          <MdBook style={{ color: '#fff', fontSize: 18 }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{loading ? '...' : unwrittenKhataCount}</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: "'Hind Siliguri', sans-serif" }}>জন বাকি</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 14 }} />)}
        </div>
      ) : unwrittenKhataCount === 0 ? (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderRadius: 20, padding: '3rem', textAlign: 'center',
          border: '1.5px solid #bbf7d0'
        }}>
          <MdCheckCircle style={{ fontSize: 60, color: '#22c55e', margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: 18, color: '#14532d', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 800 }}>
            সব খাতা আপডেট!
          </h3>
          <p style={{ fontSize: 14, color: '#16a34a', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 6 }}>
            কোনো বাকি এন্ট্রি নেই। সকল সদস্যের খাতা লেখা হয়েছে।
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {voNumbers.map(vo => {
            const members = unwrittenKhataByVO[vo]
            const isExpanded = expandedVO === vo

            return (
              <div key={vo} style={{
                background: '#fff', borderRadius: 16,
                border: '1.5px solid #fde68a',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                {/* VO Header - Clickable */}
                <button
                  onClick={() => setExpandedVO(isExpanded ? null : vo)}
                  style={{
                    width: '100%', background: isExpanded
                      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                      : 'linear-gradient(135deg, #fffbeb, #fef9ee)',
                    border: 'none', cursor: 'pointer',
                    padding: '1rem 1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <MdGroups style={{ color: '#fff', fontSize: 22 }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 800, fontSize: 15, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
                        ভিও - {String(vo).padStart(2, '0')}
                      </p>
                      <p style={{ fontSize: 12, color: '#b45309', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
                        {members.length} জনের খাতা বাকি
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      background: '#f59e0b', color: '#fff',
                      borderRadius: 20, padding: '3px 12px',
                      fontSize: 13, fontWeight: 800
                    }}>
                      {members.length}
                    </div>
                    <span style={{ color: '#92400e', fontSize: 20 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Member List */}
                {isExpanded && (
                  <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {members.map(c => {
                      const m = c.members || {}
                      return (
                        <div key={c.id} style={{
                          background: '#fffbeb', borderRadius: 12,
                          border: '1px solid #fde68a',
                          padding: '0.75rem 1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: 10, flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10,
                              background: '#fef3c7', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <MdPerson style={{ color: '#d97706', fontSize: 20 }} />
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
                                {m.full_name || 'নাম নেই'}
                              </p>
                              <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
                                সদস্য নং: #{m.member_number || '--'} &nbsp;•&nbsp;
                                {new Date(c.transaction_date).toLocaleDateString('bn-BD')}
                                {c.bkash_number && (
                                  <span style={{ color: '#be123c', marginLeft: 4 }}>
                                    <MdPhone style={{ fontSize: 11, verticalAlign: 'middle' }} /> {c.bkash_number}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <div style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", textAlign: 'right' }}>
                              <div>সঞ্চয়: <strong style={{ color: '#059669' }}>{c.current_savings} ৳</strong></div>
                              <div>কিস্তি: <strong style={{ color: '#2563eb' }}>{c.current_installment} ৳</strong></div>
                            </div>
                            <button
                              onClick={() => updateKhataStatus(c.id, true)}
                              style={{
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                padding: '0.55rem 0.85rem', fontSize: 12, fontWeight: 700,
                                fontFamily: "'Hind Siliguri', sans-serif",
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                                transition: 'transform 0.15s',
                                flexShrink: 0
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseLeave={e => e.currentTarget.style.transform = ''}
                            >
                              <MdBookmarkAdd style={{ fontSize: 16 }} />
                              খাতা লেখা হয়েছে
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UnwrittenKhataPage
