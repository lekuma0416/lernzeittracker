import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export function useSubjects(userId) {
  const [subjects, setSubjects] = useState([])

  const fetchSubjects = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    setSubjects(data ?? [])
  }, [userId])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const addSubject = async (name, color) => {
    const resolvedColor = color ?? DEFAULT_COLORS[subjects.length % DEFAULT_COLORS.length]
    const { data } = await supabase.from('subjects').insert([{ name, color: resolvedColor, user_id: userId }]).select().single()
    if (data) setSubjects(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateSubject = async (id, updates) => {
    const { data } = await supabase.from('subjects').update(updates).eq('id', id).select().single()
    if (data) setSubjects(prev => prev.map(s => s.id === id ? data : s))
  }

  const deleteSubject = async (id) => {
    await supabase.from('subjects').delete().eq('id', id)
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  return { subjects, addSubject, updateSubject, deleteSubject, refetch: fetchSubjects }
}
