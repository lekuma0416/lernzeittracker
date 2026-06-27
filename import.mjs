import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://pnngjxenbkcdbydfivmf.supabase.co'
const SUPABASE_KEY = process.argv[2]  // service_role key
const USER_ID = process.argv[3]       // User-ID aus Supabase Auth

if (!SUPABASE_KEY || !USER_ID) {
  console.error('Usage: node import.mjs SERVICE_ROLE_KEY USER_ID')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Mapping: alter Modulname → neuer Fachname
const MODULE_MAP = {
  'Mathe 2':                        'Mathe 2',
  'Mathe':                          'Mathe 2',
  'E-Technik (Zirn)':               'E-Technik',
  'Festigkeitslehre (Häfele)':      'Festigkeitslehre 1',
  'Thermodynamik (Hanak)':          'Thermo- und Fluiddynamik (Hanak)',
  'Fluiddynamik (Hanak)':           'Thermo- und Fluiddynamik (Hanak)',
  'Thermo/Fluiddynamik (Saumweber)':'Thermo- und Fluiddynamik (Saumweber)',
}

const sessions = JSON.parse(
  readFileSync('/Users/leonhardkutzias/Library/Application Support/lernzeit-tracker/sessions.json', 'utf8')
)

const userId = USER_ID
console.log('Importiere für User-ID:', userId)

// Bestehende Fächer laden
const { data: existingSubjects } = await supabase.from('subjects').select('*').eq('user_id', userId)
const subjectByName = Object.fromEntries(existingSubjects.map(s => [s.name, s.id]))
console.log('Gefundene Fächer:', Object.keys(subjectByName).join(', '))

// Sessions importieren
let imported = 0
let skipped = 0
for (const s of sessions) {
  const mappedName = MODULE_MAP[s.module]
  const subjectId = mappedName ? subjectByName[mappedName] ?? null : null

  if (s.module && !mappedName) {
    console.warn(`Kein Mapping für: "${s.module}" — wird ohne Fach importiert`)
  }

  const startedAt = s.startTime ?? s.date
  const durationSeconds = Math.round((s.durationMs ?? 0) / 1000)
  const endedAt = s.endTime ?? new Date(new Date(startedAt).getTime() + (s.durationMs ?? 0)).toISOString()

  const { error } = await supabase.from('sessions').insert({
    user_id: userId,
    subject_id: subjectId,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: durationSeconds,
    note: s.notes ?? null,
  })

  if (error) { console.error('Fehler bei Session:', error.message); skipped++; continue }
  imported++
}

console.log(`\n✓ ${imported} Sessions importiert`)
if (skipped > 0) console.log(`✗ ${skipped} fehlgeschlagen`)
