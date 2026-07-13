import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendNewHostSignupNotice } from '@/lib/email'
import { scheduleOnboardingChecks } from '@/lib/qstash'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') // 'signup' | 'recovery' | 'email_change'

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

  let exchangeError = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    exchangeError = error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'email_change' | 'magiclink',
    })
    exchangeError = error
  } else {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
  }

  if (exchangeError) {
    console.error('[auth/callback] error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
  }

  // Password reset — keep session, go to reset page
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password`)
  }

  // Email confirmed for the first time — kick off onboarding: notify the
  // onboarding team and schedule the 24h/72h/7d "no event yet" reminder sequence.
  // Best-effort: a Resend/QStash hiccup must never block the host from
  // completing signup, so failures here are logged, not thrown.
  if (type === 'signup') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const fullName = (user.user_metadata?.full_name as string | undefined) ?? null
        await Promise.all([
          sendNewHostSignupNotice({ email: user.email, fullName }),
          scheduleOnboardingChecks(user.id),
        ])
      }
    } catch (err) {
      console.error('[auth/callback] onboarding side-effects failed:', err)
    }
  }

  // Email confirmed — redirect to login with success flag
  return NextResponse.redirect(`${origin}/auth/login?confirmed=true`)
}