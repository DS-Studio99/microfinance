import React, { useState, useRef, useEffect } from 'react'
import { MdSettings, MdEditDocument, MdSecurity, MdDelete, MdCloudDownload, MdCloudUpload, MdWarning, MdCloudSync, MdVpnKey } from 'react-icons/md'
import { supabase } from '../lib/supabase'
import { useSettingsStore } from '../store/settingsStore'

const SettingsPage = () => {
  const { allowEdit, allowDelete, toggleAllowEdit, toggleAllowDelete } = useSettingsStore()
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [driveLoading, setDriveLoading] = useState(false)
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('google_client_id') || '')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script')
      script.id = 'google-gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      document.body.appendChild(script)
    }
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
        alert('ম্যানুয়াল ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!')
      }, 1000)
    } catch (err) {
      console.error(err)
      alert('ব্যাকআপ তৈরি করতে সমস্যা হয়েছে।')
    } finally {
      setBackupLoading(false)
    }
  }

  // Google Drive Direct Backup
  const handleDriveBackup = async () => {
    if (!googleClientId) {
      alert('দয়া করে প্রথমে নিচে Google Client ID সেট করুন।')
      return
    }
    
    if (!window.google || !window.google.accounts) {
      alert('গুগল সার্ভিস লোড হতে সমস্যা হচ্ছে, দয়া করে ইন্টারনেট কানেকশন চেক করুন।')
      return
    }

    setDriveLoading(true)
    
    try {
      // 1. Fetch data
      const tables = ['vo_groups', 'members', 'loan_applications', 'book_collections', 'notes']
      const backupData = {}
      for (const table of tables) {
        const { data } = await supabase.from(table).select('*')
        backupData[table] = data || []
      }
      
      // 2. Init Google Token Client
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // 3. Upload to Google Drive via multipart
              const metadata = {
                name: `brac_backup_${new Date().toISOString().split('T')[0]}.json`,
                mimeType: 'application/json',
              }
              const form = new FormData()
              form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
              form.append('file', new Blob([JSON.stringify(backupData)], { type: 'application/json' }))

              const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                body: form,
              })
              
              if (res.ok) {
                alert('সফলভাবে গুগল ড্রাইভে ব্যাকআপ সেভ হয়েছে!')
              } else {
                throw new Error('Upload failed')
              }
            } catch (err) {
              console.error(err)
              alert('গুগল ড্রাইভে আপলোড করতে সমস্যা হয়েছে।')
            } finally {
              setDriveLoading(false)
            }
          }
        },
        error_callback: () => {
          alert('গুগল লগইন বাতিল করা হয়েছে।')
          setDriveLoading(false)
        }
      })
      
      client.requestAccessToken()
    } catch (err) {
      console.error(err)
      alert('ডাটা প্রস্তুত করতে সমস্যা হয়েছে।')
      setDriveLoading(false)
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
          {/* Drive Backup Button */}
          <button 
            onClick={handleDriveBackup}
            disabled={driveLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#0ea5e9', color: '#fff', border: 'none',
              padding: '0.85rem 1rem', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: driveLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              fontFamily: "'Hind Siliguri', sans-serif", opacity: driveLoading ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!driveLoading) e.currentTarget.style.background = '#0284c7' }}
            onMouseLeave={e => { if (!driveLoading) e.currentTarget.style.background = '#0ea5e9' }}
          >
            <MdCloudSync style={{ fontSize: 20 }} />
            {driveLoading ? 'ড্রাইভে আপলোড হচ্ছে...' : 'সরাসরি গুগল ড্রাইভে ব্যাকআপ করুন'}
          </button>

          {/* Manual Backup Button */}
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
              {restoreLoading ? 'রিস্টোর হচ্ছে...' : 'যেকোনো ব্যাকআপ থেকে রিস্টোর করুন'}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', padding: '0.6rem 0.8rem', borderRadius: 8 }}>
             <MdWarning style={{ color: '#d97706', fontSize: 16 }} />
             <p style={{ fontSize: 11.5, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
               সতর্কতা: রিস্টোর করলে বর্তমান ডাটার সাথে ব্যাকআপ ডাটা যুক্ত হবে এবং ওভাররাইট হতে পারে।
             </p>
          </div>
        </div>

        {/* Google Client ID Setup */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e8edf3' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8, fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdVpnKey style={{ fontSize: 16 }} /> Google Client ID (ড্রাইভ ব্যাকআপের জন্য)
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              value={googleClientId}
              onChange={e => setGoogleClientId(e.target.value)}
              placeholder="আপনার Google OAuth Client ID দিন..."
              className="field-input"
              style={{ flex: 1, padding: '0.75rem 1rem', fontSize: 13 }}
            />
            <button 
              onClick={() => {
                localStorage.setItem('google_client_id', googleClientId)
                alert('Client ID সেভ করা হয়েছে!')
              }}
              className="btn-primary"
              style={{ padding: '0 1.25rem', borderRadius: 12, fontSize: 13 }}
            >
              সেভ করুন
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontFamily: "'Hind Siliguri', sans-serif" }}>
             ড্রাইভে অটো আপলোড কাজ করার জন্য গুগল ক্লাউড কনসোল থেকে একটি OAuth Client ID তৈরি করে এখানে বসাতে হবে।
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
