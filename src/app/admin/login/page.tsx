// src/app/login/page.tsx
'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import  getSupabaseBrowserClient   from '@/lib/supabase/client' // client.ts থেকে
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient ()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // যদি ব্যবহারকারী লগইন করে, তাকে ড্যাশবোর্ডে পাঠান
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">Admin Portal Login</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]} 
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          view="sign_in" 
          localization={{
            variables: {
              sign_in: {
               
                social_provider_text: ' ', 
              },
              
              sign_up: {
                link_text: '', 
              }
            },
          }}
         
        />
      </div>
    </div>
  )
}