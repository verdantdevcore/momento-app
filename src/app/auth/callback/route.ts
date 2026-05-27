import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'signup' | 'recovery' | 'email_change'
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password reset → go to reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      // Signup confirmation or email change → go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }

    console.error('[auth/callback] code exchange failed:', error.message)
  }

  // Something went wrong — send to login with error param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}