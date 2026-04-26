import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  MdArrowBack, MdAdd, MdEditNote, MdDelete,
  MdCheck, MdClose, MdPushPin, MdColorLens, MdEdit
} from 'react-icons/md'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const COLORS = [
  { bg: '#fef3c7', border: '#fde68a' }, // yellow
  { bg: '#e0e7ff', border: '#c7d2fe' }, // indigo
  { bg: '#dcfce7', border: '#bbf7d0' }, // green
  { bg: '#fee2e2', border: '#fecaca' }, // red
  { bg: '#f3e8ff', border: '#e9d5ff' }, // purple
  { bg: '#ffedd5', border: '#fed7aa' }, // orange
]

const NotesPage = () => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNote, setEditingNote] = useState(null) // null = not editing, {} = new note, {...} = existing
  const [deleteNoteData, setDeleteNoteData] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch notes
  const fetchNotes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Fallback to local storage if DB fails (e.g. table not created yet)
      if (error) {
        console.log('Notes table might not exist, falling back to localStorage')
        const local = localStorage.getItem('brac_notes')
        setNotes(local ? JSON.parse(local) : [])
      } else {
        setNotes(data || [])
      }
    } catch (err) {
      console.error(err)
      const local = localStorage.getItem('brac_notes')
      setNotes(local ? JSON.parse(local) : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotes() }, [])

  // Save note
  const saveNote = async () => {
    if (!editingNote || !editingNote.title) return

    const isNew = !editingNote.id
    const noteData = {
      ...editingNote,
      color: editingNote.color || COLORS[0].bg,
      updated_at: new Date().toISOString()
    }

    try {
      if (isNew) {
        const { data, error } = await supabase.from('notes').insert([noteData]).select()
        if (error) throw error
        if (data) setNotes([data[0], ...notes])
      } else {
        const { data, error } = await supabase.from('notes').update(noteData).eq('id', editingNote.id).select()
        if (error) throw error
        if (data) setNotes(notes.map(n => n.id === editingNote.id ? data[0] : n))
      }
    } catch (err) {
      console.error('Save failed, using local storage', err)
      // Fallback
      let newNotes
      if (isNew) {
        const localNote = { ...noteData, id: Date.now().toString(), created_at: new Date().toISOString() }
        newNotes = [localNote, ...notes]
      } else {
        newNotes = notes.map(n => n.id === editingNote.id ? noteData : n)
      }
      setNotes(newNotes)
      localStorage.setItem('brac_notes', JSON.stringify(newNotes))
    }

    setEditingNote(null)
  }

  // Delete note
  const handleDeleteConfirm = async () => {
    if (!deleteNoteData) return
    setDeleteLoading(true)
    const id = deleteNoteData.id
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      setNotes(notes.filter(n => n.id !== id))
    } catch (err) {
      console.error('Delete failed', err)
      const newNotes = notes.filter(n => n.id !== id)
      setNotes(newNotes)
      localStorage.setItem('brac_notes', JSON.stringify(newNotes))
    } finally {
      setDeleteLoading(false)
      setDeleteNoteData(null)
    }
  }

  return (
    <>
      <style>{`
        .notes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) { .notes-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .notes-grid { grid-template-columns: 1fr 1fr 1fr; } }
        
        .note-card {
          border-radius: 16px;
          padding: 1.25rem;
          position: relative;
          box-shadow: 0 4px 14px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .note-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .note-pin {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          background: #ef4444;
          border-radius: 50%;
          border: 4px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 10;
        }
        
        .color-picker {
          display: flex;
          gap: 8px;
          margin-top: 1rem;
        }
        .color-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .color-btn:hover {
          transform: scale(1.1);
        }
        .color-btn.active {
          border-color: #0f172a;
          transform: scale(1.1);
        }
      `}</style>

      <div className="page-enter" style={{ paddingBottom: '5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: 42, height: 42, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <MdArrowBack style={{ fontSize: 22, color: '#475569' }} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
              জরুরী নোট <MdEditNote style={{ color: '#f59e0b', fontSize: 28 }} />
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
              আপনার প্রয়োজনীয় সকল তথ্য এখানে লিখে রাখুন
            </p>
          </div>
          <button
            onClick={() => setEditingNote({ title: '', content: '', color: COLORS[0].bg })}
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', borderRadius: 12, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}
          >
            <MdAdd style={{ fontSize: 20 }} />
            নতুন নোট
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="notes-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && notes.length === 0 && !editingNote && (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <MdEditNote style={{ fontSize: 40, color: '#d97706' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif" }}>কোনো নোট নেই</h3>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4 }}>নতুন নোট যোগ করতে উপরের বাটনে ক্লিক করুন</p>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && (
          <div className="notes-grid">
            {notes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                style={{ background: note.color || '#fef3c7', border: `1px solid rgba(0,0,0,0.05)` }}
              >
                <div className="note-pin"><MdPushPin style={{ color: '#fff', fontSize: 16 }} /></div>
                
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 8, fontFamily: "'Hind Siliguri', sans-serif", marginTop: 10 }}>
                  {note.title}
                </h3>
                
                <p style={{ fontSize: 14, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                  {note.content}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 10 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {new Date(note.created_at).toLocaleDateString('bn-BD')}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => setEditingNote(note)}
                      style={{ background: 'rgba(15,23,42,0.06)', color: '#0f172a', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.06)'}
                    >
                      <MdEdit style={{ fontSize: 16 }} />
                    </button>
                    <button 
                      onClick={() => setDeleteNoteData(note)}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      <MdDelete style={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Create Modal Overlay */}
        {editingNote && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              background: '#fff', width: '100%', maxWidth: 500, borderRadius: 24,
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              animation: 'slideUp 0.3s ease-out', margin: 'auto',
              maxHeight: '90vh'
            }}>
              {/* Modal Header */}
              <div style={{ padding: '1.25rem 1.5rem', background: editingNote.color || COLORS[0].bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {editingNote.id ? 'নোট এডিট করুন' : 'নতুন নোট'}
                </h3>
                <button onClick={() => setEditingNote(null)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <MdClose style={{ fontSize: 20, color: '#0f172a' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6, fontFamily: "'Hind Siliguri', sans-serif" }}>শিরোনাম</label>
                  <input
                    type="text"
                    value={editingNote.title || ''}
                    onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                    placeholder="নোটের শিরোনাম দিন..."
                    className="field-input"
                    style={{ fontSize: 15, fontWeight: 600, padding: '0.8rem 1rem' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6, fontFamily: "'Hind Siliguri', sans-serif" }}>বিস্তারিত বিবরণ</label>
                  <textarea
                    value={editingNote.content || ''}
                    onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                    placeholder="এখানে নোট লিখুন..."
                    className="field-input"
                    style={{ minHeight: 150, resize: 'vertical', fontSize: 14, padding: '0.8rem 1rem', lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif" }}>
                    <MdColorLens style={{ fontSize: 16 }} /> নোটের রঙ
                  </label>
                  <div className="color-picker" style={{ flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <button
                        key={c.bg}
                        className={`color-btn ${(editingNote.color || COLORS[0].bg) === c.bg ? 'active' : ''}`}
                        style={{ background: c.bg }}
                        onClick={() => setEditingNote({ ...editingNote, color: c.bg })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setEditingNote(null)} className="btn-ghost" style={{ padding: '0.6rem 1.2rem' }}>বাতিল</button>
                <button onClick={saveNote} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }} disabled={!editingNote.title}>
                  <MdCheck style={{ fontSize: 20 }} /> সেভ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmModal 
          isOpen={!!deleteNoteData} 
          onClose={() => setDeleteNoteData(null)} 
          onConfirm={handleDeleteConfirm} 
          memberName={deleteNoteData?.title} 
          loading={deleteLoading} 
        />
      </div>
    </>
  )
}

export default NotesPage
