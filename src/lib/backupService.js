import { supabase } from './supabase'

// 1. Generate Backup JSON String
export const generateBackupData = async () => {
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
  
  return JSON.stringify(backupData, null, 2)
}

// 2. Upload to Supabase Storage Bucket 'backups'
export const uploadBackupToCloud = async (jsonString, fileName) => {
  const { data, error } = await supabase.storage
    .from('backups')
    .upload(fileName, jsonString, {
      contentType: 'application/json',
      upsert: true
    })
  if (error) throw error
  return data
}

// 3. List Backups
export const getCloudBackups = async () => {
  const { data, error } = await supabase.storage.from('backups').list()
  if (error) throw error
  return data.filter(file => file.name.endsWith('.json')).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// 4. Download and Parse Backup from Cloud
export const fetchCloudBackupData = async (fileName) => {
  const { data, error } = await supabase.storage.from('backups').download(fileName)
  if (error) throw error
  const text = await data.text()
  return JSON.parse(text)
}

// 5. Restore Backup Data to DB
export const restoreDataToDB = async (backupData) => {
  const tables = ['vo_groups', 'members', 'loan_applications', 'book_collections', 'notes']
  let successCount = 0
  for (const table of tables) {
    if (backupData[table] && backupData[table].length > 0) {
      const { error } = await supabase.from(table).upsert(backupData[table])
      if (error) console.error(`Error restoring ${table}:`, error)
      else successCount++
    }
  }
  return successCount
}

// 6. Delete Old Backups (Keep only last 10 days)
export const cleanupOldBackups = async () => {
  try {
    const files = await getCloudBackups()
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    
    const filesToDelete = files
      .filter(file => new Date(file.created_at) < tenDaysAgo)
      .map(file => file.name)
      
    if (filesToDelete.length > 0) {
      await supabase.storage.from('backups').remove(filesToDelete)
      console.log('Cleaned up old backups:', filesToDelete)
    }
  } catch (err) {
    console.error('Failed to cleanup old backups', err)
  }
}

// 7. Auto Backup Routine (Runs Once a Day)
export const runAutoBackupRoutine = async () => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]
    const lastBackup = localStorage.getItem('last_auto_backup_date')
    
    if (lastBackup !== todayStr) {
      console.log('Starting daily auto backup...')
      const jsonString = await generateBackupData()
      const fileName = `auto_backup_${todayStr}.json`
      
      await uploadBackupToCloud(jsonString, fileName)
      await cleanupOldBackups()
      
      localStorage.setItem('last_auto_backup_date', todayStr)
      console.log('Auto backup completed successfully!')
    }
  } catch (err) {
    console.error('Auto backup failed', err)
  }
}
