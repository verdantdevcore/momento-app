'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Footer } from '@/components/ui/Footer'
import { LoadingBar } from '@/components/ui/LoadingBar'
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

type CategoryStat = {
  category: string
  count: number
}

function SortIcon({ col, sortKey, sortDir }: { col: keyof HostStat; sortKey: keyof HostStat; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== col) return <span style={{ color: 'var(--border)', marginLeft: '4px' }}>↕</span>
  return <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), [])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [hosts, setHosts] = useState<HostStat[]>([])
  const [categories, setCategories] = useState<CategoryStat[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<keyof HostStat>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [pageLoading, setPageLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'hosts'>('overview')

  useEffect(() => {
    async function fetchData() {
      const [metricsRes, hostsRes, catsRes] = await Promise.all([
        supabase.from('platform_metrics').select('*').single(),
        supabase.from('host_stats').select('*'),
        supabase.from('events').select('category').not('category', 'is', null),
      ])
      if (metricsRes.data) setMetrics(metricsRes.data)
      if (hostsRes.data) setHosts(hostsRes.data)
      if (catsRes.data) {
        const counts: Record<string, number> = {}
        catsRes.data.forEach((e: { category: string | null }) => {
          if (e.category) counts[e.category] = (counts[e.category] ?? 0) + 1
        })
        const sorted = Object.entries(counts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
        setCategories(sorted)
      }
      setPageLoading(false)
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

  const maxCatCount = categories[0]?.count ?? 1

  const statCards = [
    { label: 'Total Hosts', value: metrics?.total_hosts ?? 0, icon: '👤', sub: 'registered accounts' },
    { label: 'Total Events', value: metrics?.total_events ?? 0, icon: '🎉', sub: 'events created' },
    { label: 'Total Uploads', value: metrics?.total_uploads ?? 0, icon: '📸', sub: 'media files' },
    { label: 'Total Views', value: metrics?.total_views ?? 0, icon: '👁', sub: 'across all feeds' },
  ]

  const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer',
    userSelect: 'none', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)',
  }
  const tdStyle: React.CSSProperties = {
    padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
  }

  if (pageLoading) return (
    <>
      <LoadingBar />
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading platform data...</p>
      </main>
    </>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>Momento</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Super Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" style={{ height: '32px', paddingLeft: '0.875rem', paddingRight: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.25rem' }}>
            ‹ Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Sidebar */}
        <aside style={{ width: '200px', backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.75rem 0.5rem' }}>Menu</p>
          {([['overview', '📊', 'Overview'], ['hosts', '👤', 'Hosts']] as const).map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', color: activeSection === id ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, background: activeSection === id ? 'rgba(85,107,47,0.15)' : 'none', border: activeSection === id ? '1px solid rgba(85,107,47,0.3)' : '1px solid transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <span>{icon}</span>{label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: '0 0 0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Momento v1.0</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', overflowX: 'hidden' }}>

          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease' }}>

              {/* Stat cards */}
              <div>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.925rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  Platform Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {statCards.map(card => (
                    <div key={card.label} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
                        <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                      </p>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.775rem', margin: 0 }}>{card.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-column: category breakdown + top hosts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                {/* Category breakdown */}
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Events by Category</h4>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.775rem' }}>{categories.length} categories</span>
                  </div>
                  {categories.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No categorised events yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {categories.slice(0, 8).map(cat => (
                        <div key={cat.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.825rem', fontWeight: 600 }}>{cat.category}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{cat.count}</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '999px', width: `${(cat.count / maxCatCount) * 100}%`, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top hosts by uploads */}
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Top Hosts</h4>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.775rem' }}>by uploads</span>
                  </div>
                  {hosts.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No hosts yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {[...hosts].sort((a, b) => b.upload_count - a.upload_count).slice(0, 5).map((host, i) => (
                        <div key={host.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: i === 0 ? 'var(--accent)' : 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: i === 0 ? '#F7E7CE' : 'var(--text-muted)', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {host.full_name ?? host.email.split('@')[0]}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: 0 }}>
                              {host.event_count} events · {host.total_views.toLocaleString()} views
                            </p>
                          </div>
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>{host.upload_count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary row */}
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0 0 0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Category</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {metrics?.top_category ?? '—'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0 0 0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg uploads per event</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {metrics && metrics.total_events > 0
                      ? (metrics.total_uploads / metrics.total_events).toFixed(1)
                      : '—'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0 0 0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg views per upload</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {metrics && metrics.total_uploads > 0
                      ? (metrics.total_views / metrics.total_uploads).toFixed(1)
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'hosts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700 }}>Host Management</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>{filtered.length} of {hosts.length} hosts</p>
                </div>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '260px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                    <thead>
                      <tr>
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
                          <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No hosts found</td>
                        </tr>
                      )}
                      {filtered.map((host, i) => (
                        <tr key={host.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={tdStyle}>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{host.full_name ?? 'Unnamed'}</p>
                          </td>
                          <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.825rem' }}>{host.email}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.event_count}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.upload_count}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.total_views.toLocaleString()}</td>
                          <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatTimeAgo(host.created_at)}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            {host.is_super_admin ? (
                              <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: '#6a8f3a', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.4)', whiteSpace: 'nowrap' }}>Admin</span>
                            ) : (
                              <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Host</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer variant="minimal" />
    </main>
  )
}