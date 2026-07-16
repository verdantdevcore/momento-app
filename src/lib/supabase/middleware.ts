import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Lock restricted and soft-deleted hosts out of the app. Their sessions are
  // revoked at the point of restriction, but a host could sign in again
  // afterwards — the account still exists until the grace period expires.
  if (user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin'))) {
    const { data: host } = await supabase
      .from('hosts')
      .select('restricted_at, deleted_at')
      .eq('id', user.id)
      .maybeSingle()

    if (host?.restricted_at || host?.deleted_at) {
      const status = host.deleted_at ? 'deleted' : 'restricted'
      await supabase.auth.signOut()

      const redirect = NextResponse.redirect(new URL(`/auth/login?account=${status}`, request.url))
      // signOut()'s cleared cookies land on supabaseResponse via the setAll
      // callback above. A fresh redirect response carries none of them, so
      // without this copy the session cookies survive and the host is bounced
      // straight back here on the next request.
      supabaseResponse.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie))
      return redirect
    }
  }

  // Redirect logged-in users away from auth pages
  // Exception: allow /auth/login?confirmed=true so the success banner shows
  const isConfirmedLanding = request.nextUrl.pathname === '/auth/login'
    && request.nextUrl.searchParams.get('confirmed') === 'true'

  // Exception: the restricted/deleted notice above redirects here. Access
  // tokens stay valid until they expire even after signOut, so getUser() can
  // still resolve a user on this request — bouncing them to /dashboard would
  // send them back here and loop until the browser gives up.
  const isAccountNotice = request.nextUrl.pathname === '/auth/login'
    && ['restricted', 'deleted'].includes(request.nextUrl.searchParams.get('account') ?? '')

  if (user && request.nextUrl.pathname.startsWith('/auth') && !isConfirmedLanding && !isAccountNotice) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}