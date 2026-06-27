import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useGoals(userId) {
  const [goals, setGoals] = useState([])

  const fetchGoals = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId)
    setGoals(data ?? [])
  }, [userId])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const upsertGoal = async (goal) => {
    const { data } = await supabase
      .from('goals')
      .upsert({ ...goal, user_id: userId }, { onConflict: 'user_id,period,subject_id' })
      .select().single()
    if (data) setGoals(prev => {
      const idx = prev.findIndex(g => g.id === data.id)
      return idx >= 0 ? prev.map(g => g.id === data.id ? data : g) : [...prev, data]
    })
    return data
  }

  const deleteGoal = async (id) => {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, upsertGoal, deleteGoal }
}
