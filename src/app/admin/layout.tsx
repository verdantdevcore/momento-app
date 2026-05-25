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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')
      const { data: host } = await supabase.from('hosts').select('is_super_admin').eq('id', user.id).single()
      if (!host?.is_super_admin) return router.push('/dashboard')
      setChecked(true)
    }
    check()
  }, [router, supabase])

  if (!checked) return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Checking access...</p>
    </main>
  )

  return <>{children}</>
}