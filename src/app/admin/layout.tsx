'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const { data: host } = await supabase.from('hosts').select('is_super_admin').eq('id', session.user.id).single()
      if (!host?.is_super_admin) { router.push('/dashboard'); return }
      setChecked(true)
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/auth/login')
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (!checked) return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Checking access...</p>
    </main>
  )

  return <>{children}</>
}