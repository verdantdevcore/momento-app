'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { formatTimeAgo } from '@/lib/utils'

type Metrics = {
  total_hosts: number
  total_events: number
  total_uploads: number
  total_views: number
  top_category: string | null
}

type HostStat = {
  id: string
  email: string
  full_name: string | null
  created_at: string
  is_super_admin: boolean
  event_count: number
  upload_count: number
  total_views: number
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), [])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [hosts, setHosts] = useState<HostStat[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: m } = await supabase.from('platform_metrics').select('*').single()
      if (m) setMetrics(m)
      const { data: h } = await supabase.from('host_stats').select('*')
      if (h) setHosts(h)
    }
    fetchData()
  }, [supabase])

  const filtered = hosts.filter(h =>
    h.email.toLowerCase().includes(search.toLowerCase()) ||
    (h.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const statCard = (value: string | number, label: string, sub?: string) => (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.125rem', fontWeight: 600 }}>{sub}</p>}
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', width: '100%' }}>
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" style={{ height: '44px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            ‹ Dashboard
          </Link>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Super Admin</h2>
        </div>
        <ThemeToggle />
      </header>

      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Platform metrics */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Platform overview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {statCard(metrics?.total_hosts ?? '—', 'Total hosts')}
            {statCard(metrics?.total_events ?? '—', 'Total events')}
            {statCard(metrics?.total_uploads ?? '—', 'Total uploads')}
            {statCard(metrics?.total_views ?? '—', 'Total views')}
            {statCard(metrics?.top_category ?? '—', 'Top category', metrics?.top_category ? 'most events' : undefined)}
          </div>
        </div>

        {/* User management */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '1rem' }}>
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Hosts ({hosts.length})</h4>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, maxWidth: '280px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.5rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {filtered.map(host => (
              <div key={host.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0, fontSize: '0.925rem' }}>
                      {host.full_name ?? 'Unnamed'}
                    </p>
                    {host.is_super_admin && (
                      <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: 'var(--accent)', fontSize: '0.675rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)' }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.125rem 0 0' }}>{host.email}</p>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: '0.125rem 0 0' }}>Joined {formatTimeAgo(host.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{host.event_count}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: 0 }}>events</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{host.upload_count}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: 0 }}>uploads</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{host.total_views}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: 0 }}>views</p>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0' }}>
                No hosts found.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}