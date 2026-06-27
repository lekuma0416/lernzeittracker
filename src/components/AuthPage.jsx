import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Lernzeit</h1>
          <p className="text-gray-400 mt-1">Erfasse deine Lernzeit</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#6366f1', brandAccent: '#4f46e5' } } } }}
            theme="dark"
            providers={[]}
            localization={{
              variables: {
                sign_in: { email_label: 'E-Mail', password_label: 'Passwort', button_label: 'Anmelden', link_text: 'Bereits ein Konto? Anmelden' },
                sign_up: { email_label: 'E-Mail', password_label: 'Passwort', button_label: 'Registrieren', link_text: 'Kein Konto? Registrieren' },
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
