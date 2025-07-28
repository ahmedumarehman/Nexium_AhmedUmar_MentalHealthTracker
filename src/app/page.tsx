'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      const query = new URLSearchParams(window.location.search)
      const accessToken = query.get('access_token')
      const refreshToken = query.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (!error && data?.session) {
          router.push('/dashboard')
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    }

    handleRedirect()
  }, [router])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setMessage('Error sending magic link.')
    } else {
      setMessage('Magic link sent! Check your email.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 px-4">
      <h1 className="text-2xl font-bold text-black mb-4">Login with Email</h1>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-sm px-4 py-2 mb-3 border border-gray-300 rounded-md text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Send Magic Link
      </button>
      {message && (
        <p className="mt-4 text-gray-700 text-sm text-center">{message}</p>
      )}
    </div>
  )
}
