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

function SortIcon({ col, sortKey, sortDir }: { col: keyof HostStat; sortKey: keyof HostStat; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== col) return <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: '#F7E7CE', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), [])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [hosts, setHosts] = useState<HostStat[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<keyof HostStat>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchData() {
      const { data: m } = await supabase.from('platform_metrics').select('*').single()
      if (m) setMetrics(m)
      const { data: h } = await supabase.from('host_stats').select('*')
      if (h) setHosts(h)
    }
    fetchData()
  }, [supabase])

  function toggleSort(key: keyof HostStat) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = hosts
    .filter(h =>
      h.email.toLowerCase().includes(search.toLowerCase()) ||
      (h.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const metricCards = [
    { label: 'Total Hosts', value: metrics?.total_hosts ?? '—', icon: '👤', color: '#0A142F' },
    { label: 'Total Events', value: metrics?.total_events ?? '—', icon: '🎉', color: '#161C2D' },
    { label: 'Total Uploads', value: metrics?.total_uploads ?? '—', icon: '📸', color: '#0A142F' },
    { label: 'Total Views', value: metrics?.total_views ?? '—', icon: '👁', color: '#161C2D' },
    { label: 'Top Category', value: metrics?.top_category ?? '—', icon: '🏆', color: '#0A142F' },
  ]

  const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.775rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid var(--border)',
  }

  const tdStyle: React.CSSProperties = {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
            Momento
          </span>
          <span style={{ color: 'var(--border)', fontSize: '1rem' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            Super Admin
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/dashboard"
            style={{ height: '36px', paddingLeft: '0.875rem', paddingRight: '0.875rem', borderRadius: '0.625rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.375rem' }}
          >
            ‹ My Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex' }}>

        {/* Sidebar */}
        <aside style={{ width: '220px', backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.5rem 0.5rem' }}>
            Navigation
          </p>
          {[
            { label: 'Overview', href: '#overview', icon: '📊' },
            { label: 'Hosts', href: '#hosts', icon: '👤' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', backgroundColor: 'transparent' }}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textAlign: 'center' }}>
              Momento v1.0
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowX: 'auto' }}>

          {/* Overview section */}
          <div id="overview" style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700 }}>
              Platform Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {metricCards.map(card => (
                <div
                  key={card.label}
                  style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</p>
                    <span style={{ fontSize: '1.125rem' }}>{card.icon}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hosts section */}
          <div id="hosts">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                Hosts
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 400, marginLeft: '0.5rem' }}>
                  ({filtered.length} of {hosts.length})
                </span>
              </h2>
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '280px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <th style={thStyle} onClick={() => toggleSort('full_name')}>Name <SortIcon col="full_name" sortKey={sortKey} sortDir={sortDir} /></th>
                      <th style={thStyle} onClick={() => toggleSort('email')}>Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} /></th>
                      <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleSort('event_count')}>Events <SortIcon col="event_count" sortKey={sortKey} sortDir={sortDir} /></th>
                      <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleSort('upload_count')}>Uploads <SortIcon col="upload_count" sortKey={sortKey} sortDir={sortDir} /></th>
                      <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleSort('total_views')}>Views <SortIcon col="total_views" sortKey={sortKey} sortDir={sortDir} /></th>
                      <th style={thStyle} onClick={() => toggleSort('created_at')}>Joined <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} /></th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                          No hosts found
                        </td>
                      </tr>
                    )}
                    {filtered.map((host, i) => (
                      <tr
                        key={host.id}
                        style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                      >
                        <td style={tdStyle}>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {host.full_name ?? 'Unnamed'}
                          </p>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{host.email}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.event_count}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.upload_count}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.total_views.toLocaleString()}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatTimeAgo(host.created_at)}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          {host.is_super_admin ? (
                            <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: '#6a8f3a', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.4)', whiteSpace: 'nowrap' }}>
                              Admin
                            </span>
                          ) : (
                            <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                              Host
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}