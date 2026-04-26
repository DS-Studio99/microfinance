import React, { useState, useRef, useEffect } from 'react'
import { MdSettings, MdEditDocument, MdSecurity, MdDelete, MdCloudDownload, MdCloudUpload, MdWarning, MdHistory, MdRestore } from 'react-icons/md'
import { supabase } from '../lib/supabase'
import { getCloudBackups, fetchCloudBackupData, restoreDataToDB, generateBackupData, uploadBackupToCloud } from '../lib/backupService'
import { useSettingsStore } from '../store/settingsStore'

const SettingsPage = () => {
  const { allowEdit, allowDelete, toggleAllowEdit, toggleAllowDelete } = useSettingsStore()
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [cloudBackups, setCloudBackups] = useState([])
  const [fetchingBackups, setFetchingBackups] = useState(false)
  const fileInputRef = useRef(null)

  const loadCloudBackups = async () => {
    setFetchingBackups(true)
    try {
      const files = await getCloudBackups()
      setCloudBackups(files || [])
    } catch (err) {
      console.error('Failed to load cloud backups', err)
    } finally {
      setFetchingBackups(false)
    }
  }

  useEffect(() => {
    loadCloudBackups()
  }, [])

  const handleBackup = async () => {
    setBackupLoading(true)
    try {
      const tables = ['vo_groups', 'members', 'loan_applications', 'book_collections', 'notes']
      const backupData = {}
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*')
        if (error) {
          console.warn(`Could not fetch ${table}`, error)
          backupData[table] = []
        } else {
          backupData[table] = data || []
        }
      }
      
      const jsonString = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `brac_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        alert('ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!')
      }, 1000)
    } catch (err) {
      console.error(err)
      alert('ব্যাকআপ তৈরি করতে সমস্যা হয়েছে।')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleRestore = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই ব্যাকআপ থেকে ডাটা রিস্টোর করতে চান? এটি সাইটের বর্তমান ডাটা ওভাররাইট করবে!')) {
      event.target.value = ''
      return
    }

    setRestoreLoading(true)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result)
        const tables = ['vo_groups', 'members', 'loan_applications', 'book_collections', 'notes']
        
        let successCount = 0
        for (const table of tables) {
          if (backupData[table] && backupData[table].length > 0) {
            // using upsert to prevent unique constraint errors (assuming id/primary keys match)
            const { error } = await supabase.from(table).upsert(backupData[table])
            if (error) {
              console.error(`Error restoring ${table}:`, error)
            } else {
              successCount++
            }
          }
        }
        
        alert('রিস্টোর সফলভাবে সম্পন্ন হয়েছে! দয়া করে পেজটি রিফ্রেশ করুন।')
        window.location.reload()
      } catch (err) {
        alert('ফাইলটি সঠিক নয় অথবা রিস্টোর করতে সমস্যা হয়েছে।')
        console.error(err)
      } finally {
        setRestoreLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    
    reader.onerror = () => {
      alert('ফাইলটি পড়তে সমস্যা হয়েছে।')
      setRestoreLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    
    reader.readAsText(file)
  }

  const handleInstantCloudBackup = async () => {
    setBackupLoading(true)
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
      const fileName = `manual_cloud_backup_${todayStr}_${timeStr}.json`
      
      const jsonString = await generateBackupData()
      await uploadBackupToCloud(jsonString, fileName)
      
      alert('ক্লাউডে ব্যাকআপ সফলভাবে সেভ হয়েছে!')
      loadCloudBackups() // Refresh the list
    } catch (err) {
      console.error(err)
      alert('ক্লাউডে ব্যাকআপ সেভ করতে সমস্যা হয়েছে।')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleCloudRestore = async (fileName) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে আপনি '${fileName}' থেকে ডাটা রিস্টোর করতে চান? এটি সাইটের বর্তমান ডাটা ওভাররাইট করবে!`)) return
    
    setRestoreLoading(true)
    try {
      const backupData = await fetchCloudBackupData(fileName)
      await restoreDataToDB(backupData)
      alert('রিস্টোর সফলভাবে সম্পন্ন হয়েছে! দয়া করে পেজটি রিফ্রেশ করুন।')
      window.location.reload()
    } catch (err) {
      alert('ক্লাউড থেকে রিস্টোর করতে সমস্যা হয়েছে।')
      console.error(err)
    } finally {
      setRestoreLoading(false)
    }
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MdSettings style={{ color: '#fff', fontSize: 22 }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
            সেটিংস
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
            সিস্টেমের বিভিন্ন নিয়ন্ত্রণ অপশন
          </p>
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 18, border: '1px solid #e8edf3',
        padding: '1.25rem', boxShadow: '0 2px 10px rgba(15,23,42,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 15 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MdSecurity style={{ color: '#ef4444', fontSize: 20 }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', fontFamily: "'Hind Siliguri', sans-serif" }}>ডাটা সম্পাদনা ও মুছে ফেলা</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4, lineHeight: 1.5 }}>
              এই অপশনগুলি বন্ধ করলে সাধারণ ব্যবহারকারীরা মেম্বার ও ভিও (VO) এর তথ্য সম্পাদনা (Edit) বা মুছে (Delete) ফেলতে পারবেন না।
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Edit Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: allowEdit ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${allowEdit ? '#86efac' : '#e2e8f0'}`,
            padding: '0.85rem 1.1rem', borderRadius: 14,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdEditDocument style={{ fontSize: 20, color: allowEdit ? '#22c55e' : '#94a3b8' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডাটা এডিট অনাবেল করুন
              </span>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
              <input type="checkbox" checked={allowEdit} onChange={toggleAllowEdit} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div style={{
                width: 48, height: 26, borderRadius: 13,
                background: allowEdit ? '#22c55e' : '#cbd5e1',
                position: 'relative', transition: 'background 0.25s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: allowEdit ? 'translateX(22px)' : 'translateX(0)',
                }} />
              </div>
            </label>
          </div>

          {/* Delete Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: allowDelete ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${allowDelete ? '#fca5a5' : '#e2e8f0'}`,
            padding: '0.85rem 1.1rem', borderRadius: 14,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdDelete style={{ fontSize: 20, color: allowDelete ? '#ef4444' : '#94a3b8' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডাটা ডিলিট অনাবেল করুন
              </span>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
              <input type="checkbox" checked={allowDelete} onChange={toggleAllowDelete} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div style={{
                width: 48, height: 26, borderRadius: 13,
                background: allowDelete ? '#ef4444' : '#cbd5e1',
                position: 'relative', transition: 'background 0.25s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: allowDelete ? 'translateX(22px)' : 'translateX(0)',
                }} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div style={{
        background: '#fff', borderRadius: 18, border: '1px solid #e8edf3',
        padding: '1.25rem', boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
        marginTop: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 15 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MdCloudDownload style={{ color: '#3b82f6', fontSize: 20 }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', fontFamily: "'Hind Siliguri', sans-serif" }}>ডাটা ব্যাকআপ ও রিস্টোর</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4, lineHeight: 1.5 }}>
              আপনার সাইটের সকল তথ্য (সদস্য, ভিও, লোন, কালেকশন ও নোট) একটি ফাইলে ব্যাকআপ করে রাখতে পারবেন এবং পরবর্তীতে যেকোনো সময় তা রিস্টোর করতে পারবেন।
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {/* Backup Button */}
          <button 
            onClick={handleBackup}
            disabled={backupLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#3b82f6', color: '#fff', border: 'none',
              padding: '0.85rem 1rem', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: backupLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              fontFamily: "'Hind Siliguri', sans-serif", opacity: backupLoading ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!backupLoading) e.currentTarget.style.background = '#2563eb' }}
            onMouseLeave={e => { if (!backupLoading) e.currentTarget.style.background = '#3b82f6' }}
          >
            <MdCloudDownload style={{ fontSize: 20 }} />
            {backupLoading ? 'ম্যানুয়াল ব্যাকআপ তৈরি হচ্ছে...' : 'ম্যানুয়াল ব্যাকআপ ডাউনলোড করুন'}
          </button>

          {/* Restore Button */}
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef}
              onChange={handleRestore}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={restoreLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#f8fafc', color: '#0f172a', border: '1.5px solid #e2e8f0',
                padding: '0.85rem 1rem', borderRadius: 12, fontSize: 14, fontWeight: 700,
                cursor: restoreLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                fontFamily: "'Hind Siliguri', sans-serif", width: '100%', opacity: restoreLoading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!restoreLoading) e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { if (!restoreLoading) e.currentTarget.style.background = '#f8fafc' }}
            >
              <MdCloudUpload style={{ fontSize: 20, color: '#475569' }} />
              {restoreLoading ? 'রিস্টোর হচ্ছে...' : 'ম্যানুয়াল ব্যাকআপ থেকে রিস্টোর করুন'}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', padding: '0.6rem 0.8rem', borderRadius: 8 }}>
             <MdWarning style={{ color: '#d97706', fontSize: 16 }} />
             <p style={{ fontSize: 11.5, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
               সতর্কতা: রিস্টোর করলে বর্তমান ডাটার সাথে ব্যাকআপ ডাটা যুক্ত হবে এবং ওভাররাইট হতে পারে।
             </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '1rem 0' }} />

          {/* Cloud Auto Backups List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdHistory style={{ color: '#64748b', fontSize: 18 }} /> ক্লাউড ব্যাকআপ তালিকা
              </h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={handleInstantCloudBackup} 
                  disabled={backupLoading}
                  style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: 12, cursor: backupLoading ? 'not-allowed' : 'pointer', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <MdCloudUpload style={{ fontSize: 14 }} /> এখনি ব্যাকআপ নিন
                </button>
                <button onClick={loadCloudBackups} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#3b82f6', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700 }}>
                  রিফ্রেশ
                </button>
              </div>
            </div>
            
            {fetchingBackups ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 12 }}>
                <div className="spinner" style={{ width: 24, height: 24, border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>লোড হচ্ছে...</p>
              </div>
            ) : cloudBackups.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 12, color: '#64748b', fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>
                কোনো ক্লাউড ব্যাকআপ পাওয়া যায়নি।
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cloudBackups.map((file) => (
                  <div key={file.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem 1rem' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
                        {new Date(file.created_at).toLocaleString('bn-BD')} • {(file.metadata?.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCloudRestore(file.name)}
                      disabled={restoreLoading}
                      style={{ background: '#dcfce7', color: '#16a34a', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: restoreLoading ? 'not-allowed' : 'pointer', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <MdRestore style={{ fontSize: 14 }} /> রিস্টোর
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 8, textAlign: 'center' }}>
              সিস্টেম প্রতিদিন স্বয়ংক্রিয়ভাবে ব্যাকআপ নেয় এবং শেষের ১০ দিনের ব্যাকআপ সংরক্ষণ করে।
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
