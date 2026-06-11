'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Footer } from '@/components/ui/Footer'
import { LoadingBar } from '@/components/ui/LoadingBar'
import { formatTimeAgo } from '@/lib/utils'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

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
  if (sortKey !== col) return <span style={{ color: 'var(--border)', marginLeft: '0.25rem' }}>↕</span>
  return <span style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
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
  const { isMobile } = useWindowWidth()

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

  const topCategory = categories[0] ?? null
  const restCategories = categories.slice(1)
  const maxCount = categories[0]?.count ?? 1

  const categoryEmojis: Record<string, string> = {
    Wedding: '💍', Birthday: '🎂', Anniversary: '🥂', Engagement: '💌',
    Graduation: '🎓', 'Baby Shower': '🍼', Corporate: '💼', Conference: '🎤',
    Concert: '🎵', Festival: '🎊', Reunion: '🤝', Other: '📌',
  }

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

  const navItems = [
    { id: 'overview' as const, icon: '📊', label: 'Overview' },
    { id: 'hosts'    as const, icon: '👤', label: 'Hosts'    },
  ]

  if (pageLoading) return (
    <>
      <LoadingBar />
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading platform data...</p>
      </main>
    </>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '4rem' : 0 }}>

      {/* ── Top header ── */}
      <header style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        paddingLeft: '1rem', paddingRight: '1rem',
        height: '3.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            {isMobile ? 'Admin' : 'Super Admin'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Link href="/dashboard" style={{
            height: '2rem', paddingLeft: '0.75rem', paddingRight: '0.75rem',
            borderRadius: '0.5rem', border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)',
            fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            ‹ Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Body: sidebar (desktop) + content ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{
            width: '12.5rem', backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            padding: '1.25rem 0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
            flexShrink: 0,
          }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.75rem 0.5rem' }}>Menu</p>
            {navItems.map(({ id, icon, label }) => (
              <button key={id} onClick={() => setActiveSection(id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
                color: activeSection === id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.875rem', fontWeight: 600,
                background: activeSection === id ? 'rgba(85,107,47,0.15)' : 'none',
                border: activeSection === id ? '1px solid rgba(85,107,47,0.3)' : '1px solid transparent',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}>
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
        )}

        {/* Main content area */}
        <div style={{ flex: 1, padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>

          {/* ── OVERVIEW section ── */}
          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease' }}>

              {/* Stat cards — 2-col on mobile, 4-col auto on desktop */}
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Platform Overview</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(11.25rem, 1fr))', gap: '0.75rem' }}>
                  {statCards.map(card => (
                    <div key={card.label} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: isMobile ? '1rem' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
                        <span style={{ fontSize: '1.125rem' }}>{card.icon}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                      </p>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem', margin: 0 }}>{card.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Computed metrics — stack to 1-col on mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Avg uploads / event', value: metrics && metrics.total_events > 0 ? (metrics.total_uploads / metrics.total_events).toFixed(1) : '—' },
                  { label: 'Avg views / upload',  value: metrics && metrics.total_uploads > 0 ? (metrics.total_views / metrics.total_uploads).toFixed(1) : '—' },
                  { label: 'Avg events / host',   value: metrics && metrics.total_hosts > 0 ? (metrics.total_events / metrics.total_hosts).toFixed(1) : '—' },
                ].map(item => (
                  <div key={item.label} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: isMobile ? 'space-between' : 'flex-start', gap: '0.375rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Event Categories</p>

                  {topCategory && (
                    <div style={{ backgroundColor: 'var(--accent)', borderRadius: '1rem', padding: isMobile ? '1.125rem' : '1.5rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: '-1rem', top: '-1rem', fontSize: '6rem', opacity: 0.15, lineHeight: 1 }}>
                        {categoryEmojis[topCategory.category] ?? '🏆'}
                      </div>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                          <span style={{ backgroundColor: 'rgba(247,231,206,0.2)', color: '#F7E7CE', fontSize: '0.7rem', fontWeight: 700, paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: '0.5rem', paddingRight: '0.5rem', borderRadius: '999px', border: '1px solid rgba(247,231,206,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            🏆 Top Category
                          </span>
                        </div>
                        <p style={{ color: '#F7E7CE', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                          {categoryEmojis[topCategory.category] ?? ''} {topCategory.category}
                        </p>
                        <p style={{ color: 'rgba(247,231,206,0.75)', fontSize: '0.825rem', margin: '0.25rem 0 0' }}>
                          {topCategory.count} event{topCategory.count !== 1 ? 's' : ''} · {((topCategory.count / (metrics?.total_events ?? 1)) * 100).toFixed(0)}% of all events
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', position: 'relative', zIndex: 1, flexShrink: 0 }}>
                        <p style={{ color: '#F7E7CE', fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 900, margin: 0, lineHeight: 1, letterSpacing: '-0.04em' }}>{topCategory.count}</p>
                        <p style={{ color: 'rgba(247,231,206,0.6)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>events</p>
                      </div>
                    </div>
                  )}

                  {restCategories.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(12.5rem, 1fr))', gap: '0.625rem' }}>
                      {restCategories.map((cat, i) => (
                        <div key={cat.category} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1.25rem' }}>{categoryEmojis[cat.category] ?? '📌'}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>#{i + 2}</span>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{cat.category}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{cat.count} event{cat.count !== 1 ? 's' : ''}</p>
                          </div>
                          <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '999px', width: `${(cat.count / maxCount) * 100}%`, opacity: 0.6 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Top hosts by uploads */}
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Top Hosts by Uploads</h4>
                  <button onClick={() => setActiveSection('hosts')} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {[...hosts].sort((a, b) => b.upload_count - a.upload_count).slice(0, 5).map((host, i) => (
                    <div key={host.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: i === 0 ? 'var(--accent)' : 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: i === 0 ? '#F7E7CE' : 'var(--text-muted)', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {host.full_name ?? host.email.split('@')[0]}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                          {host.event_count} events · {host.total_views.toLocaleString()} views
                        </p>
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>{host.upload_count} uploads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HOSTS section ── */}
          {activeSection === 'hosts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700 }}>Host Management</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>{filtered.length} of {hosts.length} hosts</p>
                </div>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: isMobile ? '100%' : '16.25rem',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.625rem',
                    paddingTop: '0.5rem', paddingBottom: '0.5rem',
                    paddingLeft: '0.875rem', paddingRight: '0.875rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* On mobile: card list. On desktop: table */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {filtered.length === 0 && (
                    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '2.5rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No hosts found</p>
                    </div>
                  )}
                  {filtered.map(host => (
                    <div key={host.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.925rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {host.full_name ?? 'Unnamed'}
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0.125rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {host.email}
                          </p>
                        </div>
                        {host.is_super_admin
                          ? <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: '#6a8f3a', fontSize: '0.7rem', fontWeight: 700, paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: '0.6rem', paddingRight: '0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.4)', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '0.5rem' }}>Admin</span>
                          : <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: '0.6rem', paddingRight: '0.6rem', borderRadius: '999px', border: '1px solid var(--border)', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '0.5rem' }}>Host</span>
                        }
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}>
                        {[
                          { label: 'Events',  value: host.event_count },
                          { label: 'Uploads', value: host.upload_count },
                          { label: 'Views',   value: host.total_views.toLocaleString() },
                        ].map(stat => (
                          <div key={stat.label} style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>{stat.value}</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: '0.1rem 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.725rem', margin: '0.625rem 0 0' }}>Joined {formatTimeAgo(host.created_at)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '42.5rem' }}>
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
                          <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No hosts found</td></tr>
                        )}
                        {filtered.map((host, i) => (
                          <tr key={host.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                            <td style={tdStyle}><p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{host.full_name ?? 'Unnamed'}</p></td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.825rem' }}>{host.email}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.event_count}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.upload_count}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.total_views.toLocaleString()}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatTimeAgo(host.created_at)}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              {host.is_super_admin
                                ? <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: '#6a8f3a', fontSize: '0.7rem', fontWeight: 700, paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: '0.6rem', paddingRight: '0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.4)', whiteSpace: 'nowrap' }}>Admin</span>
                                : <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: '0.6rem', paddingRight: '0.6rem', borderRadius: '999px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Host</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '4rem',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch',
          zIndex: 40,
        }}>
          {navItems.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.25rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeSection === id ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                borderTop: activeSection === id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      )}

      {!isMobile && <Footer variant="minimal" />}
    </main>
  )
}
