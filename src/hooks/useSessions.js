import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSessions(userId) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
    setSessions(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const addSession = async (session) => {
    const { data } = await supabase.from('sessions').insert([{ ...session, user_id: userId }]).select().single()
    if (data) setSessions(prev => [data, ...prev])
    return data
  }

  const updateSession = async (id, updates) => {
    const { data } = await supabase.from('sessions').update(updates).eq('id', id).select().single()
    if (data) setSessions(prev => prev.map(s => s.id === id ? data : s))
    return data
  }

  const deleteSession = async (id) => {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  return { sessions, loading, addSession, updateSession, deleteSession, refetch: fetchSessions }
}
