import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useCollections = () => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch collections along with member details
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select(`
          *,
          members (
            full_name,
            member_number,
            vo_number
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setCollections(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('কালেকশন লোড করতে ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const addCollection = async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('collections')
        .insert([{ ...data, status: 'pending' }])
        .select()
        .single()

      if (error) throw error
      toast.success('কালেকশন সফলভাবে সেভ হয়েছে')
      fetchCollections()
      return { data: result, error: null }
    } catch (err) {
      toast.error('কালেকশন সেভ করতে ব্যর্থ হয়েছে: ' + (err.message || 'Unknown error'))
      return { data: null, error: err }
    }
  }

  const markAsCompleted = async (id) => {
    try {
      const { error } = await supabase
        .from('collections')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast.success('পোস্টিং সম্পন্ন হয়েছে')
      fetchCollections()
      return { error: null }
    } catch (err) {
      toast.error('পোস্টিং সম্পন্ন করতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  const deleteCollection = async (id) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('কালেকশন মুছে ফেলা হয়েছে')
      fetchCollections()
      return { error: null }
    } catch (err) {
      toast.error('কালেকশন মুছতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  const updateKhataStatus = async (id, written) => {
    try {
      const { error } = await supabase
        .from('collections')
        .update({ khata_written: written })
        .eq('id', id)

      if (error) throw error
      toast.success(written ? 'বই লেখা হয়েছে হিসেবে চিহ্নিত' : 'বই লেখা হয়নি হিসেবে চিহ্নিত')
      fetchCollections()
      return { error: null }
    } catch (err) {
      toast.error('বই অবস্থা আপডেট ব্যর্থ')
      return { error: err }
    }
  }

  // Derive unwritten khata collections (paid but khata not written)
  const unwrittenKhata = collections.filter(c => c.khata_written === false || c.khata_written === null)

  // Group unwritten by VO
  const unwrittenKhataByVO = unwrittenKhata.reduce((acc, c) => {
    const vo = c.members?.vo_number || c.vo_number || '?'
    if (!acc[vo]) acc[vo] = []
    acc[vo].push(c)
    return acc
  }, {})

  return {
    collections,
    pendingCollections: collections.filter(c => c.status === 'pending'),
    completedCollections: collections.filter(c => c.status === 'completed'),
    unwrittenKhata,
    unwrittenKhataByVO,
    unwrittenKhataCount: unwrittenKhata.length,
    loading,
    error,
    fetchCollections,
    addCollection,
    markAsCompleted,
    deleteCollection,
    updateKhataStatus
  }
}
