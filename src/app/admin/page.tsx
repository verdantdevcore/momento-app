'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Footer } from '@/components/ui/Footer'
import { LoadingBar } from '@/components/ui/LoadingBar'
import { formatTimeAgo, formatEventDate } from '@/lib/utils'
import { ChromeLogo } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

// ─── Types ───────────────────────────────────────────────────────────────────

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
  restricted_at: string | null
  restricted_reason: string | null
  deleted_at: string | null
  deletion_reason: string | null
  purge_after: string | null
}

type AccountStatus = 'active' | 'restricted' | 'deleted'

function hostStatus(host: HostStat): AccountStatus {
  if (host.deleted_at) return 'deleted'
  if (host.restricted_at) return 'restricted'
  return 'active'
}

// Which account action the reason modal is collecting input for.
type PendingAction = {
  host: HostStat
  action: 'restrict' | 'unrestrict' | 'delete' | 'restore' | 'purge'
}

type AdminEvent = {
  id: string
  title: string
  slug: string
  category: string | null
  event_date: string | null
  location: string | null
  created_at: string
  host_id: string
}

type AuditLog = {
  id: string
  event_type: string
  user_id: string | null
  user_email: string | null
  ip_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type CategoryStat = { category: string; count: number }
type Section = 'overview' | 'hosts' | 'events' | 'auditlogs'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const categoryEmojis: Record<string, string> = {
  Wedding: '💍', Birthday: '🎂', Anniversary: '🥂', Engagement: '💌',
  Graduation: '🎓', 'Baby Shower': '🍼', 'Bridal Shower': '👰', Corporate: '💼', Conference: '🎤',
  Concert: '🎵', Festival: '🎊', Reunion: '🤝', Outreach: '📣', Sports: '⚽',
  'Games Night': '🎮', Vacation: '🏖️', Other: '📌',
}

const auditIcons: Record<string, string> = {
  media_deleted: '🗑',
  media_delete_unauthorised: '🚫',
  cloudinary_delete_failed: '⚠️',
  admin_promoted: '⬆️',
  admin_demoted: '⬇️',
  signup: '🆕',
  login: '🔑',
  logout: '🚪',
  event_deleted: '🗓',
  event_delete_unauthorised: '🚫',
  account_restricted: '🔒',
  account_unrestricted: '🔓',
  account_deleted: '⛔',
  account_restored: '♻️',
  account_purged: '🔥',
  account_purge_failed: '⚠️',
  upload_blocked_inactive_host: '🚫',
}

function SortIcon<T>({ col, sortKey, sortDir }: { col: keyof T; sortKey: keyof T; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== col) return <span style={{ color: 'var(--border)', marginLeft: '0.25rem' }}>↕</span>
  return <span style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

const badgeBase: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
  borderRadius: '999px', whiteSpace: 'nowrap',
}

const statusBadgeStyles: Record<AccountStatus, React.CSSProperties> = {
  active:     { ...badgeBase, backgroundColor: 'rgba(85,107,47,0.2)',  color: '#6a8f3a', border: '1px solid rgba(85,107,47,0.4)' },
  restricted: { ...badgeBase, backgroundColor: 'rgba(234,179,8,0.12)', color: '#b98900', border: '1px solid rgba(234,179,8,0.4)' },
  deleted:    { ...badgeBase, backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' },
}

const statusLabels: Record<AccountStatus, string> = {
  active: 'Active', restricted: 'Restricted', deleted: 'Deleted',
}

function StatusBadge({ host }: { host: HostStat }) {
  const status = hostStatus(host)
  return <span style={statusBadgeStyles[status]}>{statusLabels[status]}</span>
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), [])
  const { isMobile } = useWindowWidth()

  // Data
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [hosts, setHosts] = useState<HostStat[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [categories, setCategories] = useState<CategoryStat[]>([])
  const [mediaItems, setMediaItems] = useState<{ type: string; views: number; event_id: string }[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // UI state
  const [pageLoading, setPageLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditLoaded, setAuditLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('overview')

  // Hosts section
  const [hostSearch, setHostSearch] = useState('')
  const [hostSortKey, setHostSortKey] = useState<keyof HostStat>('created_at')
  const [hostSortDir, setHostSortDir] = useState<'asc' | 'desc'>('desc')
  const [roleLoading, setRoleLoading] = useState<string | null>(null)

  // Account moderation
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionToast, setActionToast] = useState('')

  // Events section
  const [eventSearch, setEventSearch] = useState('')
  const [eventSortKey, setEventSortKey] = useState<keyof AdminEvent>('created_at')
  const [eventSortDir, setEventSortDir] = useState<'asc' | 'desc'>('desc')

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchData() {
      // Get the current user's session from the browser client (for currentUserId only)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setCurrentUserId(session.user.id)

      // All platform data comes from the service-role API route — bypasses RLS
      const res = await fetch('/api/admin/data')
      if (!res.ok) { setPageLoading(false); return }
      const json = await res.json()

      if (json.metrics)    setMetrics(json.metrics)
      if (json.hosts)      setHosts(json.hosts)
      if (json.events)     setEvents(json.events)
      if (json.mediaItems) setMediaItems(json.mediaItems)

      // Derive categories from the full events list
      if (json.events) {
        const counts: Record<string, number> = {}
        json.events.forEach((e: { category: string | null }) => {
          if (e.category) counts[e.category] = (counts[e.category] ?? 0) + 1
        })
        setCategories(
          Object.entries(counts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
        )
      }

      setPageLoading(false)
    }
    fetchData()
  }, [supabase])

  const loadAuditLogs = useCallback(async () => {
    if (auditLoaded) return
    setAuditLoading(true)
    try {
      const res = await fetch('/api/admin/audit-logs?limit=200')
      if (res.ok) {
        const json = await res.json()
        setAuditLogs(json.logs ?? [])
        setAuditLoaded(true)
      }
    } finally {
      setAuditLoading(false)
    }
  }, [auditLoaded])

  useEffect(() => {
    if (activeSection === 'auditlogs' && !auditLoaded) loadAuditLogs()
  }, [activeSection, auditLoaded, loadAuditLogs])

  // ── Hosts helpers ─────────────────────────────────────────────────────────

  function toggleHostSort(key: keyof HostStat) {
    if (hostSortKey === key) setHostSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setHostSortKey(key); setHostSortDir('desc') }
  }

  const filteredHosts = hosts
    .filter(h =>
      h.email.toLowerCase().includes(hostSearch.toLowerCase()) ||
      (h.full_name ?? '').toLowerCase().includes(hostSearch.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[hostSortKey] ?? ''; const bv = b[hostSortKey] ?? ''
      return (hostSortDir === 'asc' ? 1 : -1) * (av < bv ? -1 : av > bv ? 1 : 0)
    })

  async function handleSetRole(targetId: string, promote: boolean) {
    setRoleLoading(targetId)
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, isSuperAdmin: promote }),
      })
      if (res.ok) {
        setHosts(prev => prev.map(h => h.id === targetId ? { ...h, is_super_admin: promote } : h))
      }
    } finally {
      setRoleLoading(null)
    }
  }

  // Deleted accounts stay listed so they can be restored, so the header count
  // calls them out separately rather than quietly including them.
  const deletedHostCount = hosts.filter(h => h.deleted_at).length

  function openAction(host: HostStat, action: PendingAction['action']) {
    setPendingAction({ host, action })
    setActionReason('')
    setActionError('')
  }

  // Applies the pending restrict/unrestrict/delete/restore action. The server
  // is the authority on what's allowed (e.g. acting on another admin); this
  // just surfaces its error.
  async function confirmAction() {
    if (!pendingAction) return
    const { host, action } = pendingAction
    const reason = actionReason.trim() || null

    setActionLoading(true)
    setActionError('')
    try {
      const request = {
        restrict:   { url: '/api/admin/restrict-user', method: 'POST',   body: { targetId: host.id, restrict: true, reason } },
        unrestrict: { url: '/api/admin/restrict-user', method: 'POST',   body: { targetId: host.id, restrict: false } },
        delete:     { url: '/api/admin/delete-user',   method: 'POST',   body: { targetId: host.id, reason } },
        restore:    { url: '/api/admin/delete-user',   method: 'DELETE', body: { targetId: host.id } },
        purge:      { url: '/api/admin/purge-user',    method: 'POST',   body: { targetId: host.id } },
      }[action]

      const res = await fetch(request.url, {
        method: request.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Action failed')

      if (action === 'purge') {
        // The row is gone from the database now, not merely flagged — so it
        // leaves the table rather than changing status.
        setHosts(prev => prev.filter(h => h.id !== host.id))
      } else {
        const now = new Date().toISOString()
        setHosts(prev => prev.map(h => {
          if (h.id !== host.id) return h
          switch (action) {
            case 'restrict':   return { ...h, restricted_at: now, restricted_reason: reason }
            case 'unrestrict': return { ...h, restricted_at: null, restricted_reason: null }
            case 'delete':     return { ...h, deleted_at: now, deletion_reason: reason, purge_after: json.purgeAfter ?? null }
            case 'restore':    return { ...h, deleted_at: null, deletion_reason: null, purge_after: null }
          }
        }))
      }

      const name = host.full_name ?? host.email
      const past = {
        restrict: 'restricted', unrestrict: 'restored', delete: 'deleted',
        restore: 'restored', purge: 'permanently deleted',
      }[action]
      // emailSent is undefined for restore and purge (neither sends a notice).
      const emailNote = json.emailSent === false ? ' — but the email notification failed to send' : ''
      setActionToast(`${name} ${past}${emailNote}`)
      setPendingAction(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  // A plain render function rather than a nested component, so React doesn't
  // remount the buttons on every parent render.
  function renderAccountActions(host: HostStat, stacked: boolean) {
    if (host.id === currentUserId) {
      return <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>You</span>
    }

    const status = hostStatus(host)
    // Only the role button is disabled while its own request is in flight, so
    // only it gets the disabled affordance.
    const busy = roleLoading === host.id
    const btn = (extra: React.CSSProperties, disabled = false): React.CSSProperties => ({
      padding: stacked ? '0.5rem' : '0.3rem 0.75rem',
      width: stacked ? '100%' : undefined,
      borderRadius: '0.5rem',
      fontSize: stacked ? '0.775rem' : '0.75rem',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: '1px solid var(--border)',
      whiteSpace: 'nowrap',
      opacity: disabled ? 0.6 : 1,
      ...extra,
    })
    // Solid fills rather than faint tints: on the light table these read as
    // real buttons, and each pairing clears 4.5:1 for its label.
    const neutral = { backgroundColor: 'var(--accent)', color: '#F7E7CE', borderColor: 'transparent' }
    const warn    = { backgroundColor: '#B45309',       color: '#FFF7ED', borderColor: 'transparent' }
    const danger  = { backgroundColor: '#B91C1C',       color: '#FEF2F2', borderColor: 'transparent' }

    return (
      <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: '0.375rem', justifyContent: 'center' }}>
        <button disabled={busy} onClick={() => handleSetRole(host.id, !host.is_super_admin)} style={btn(host.is_super_admin ? danger : neutral, busy)}>
          {busy ? '...' : host.is_super_admin ? 'Revoke Admin' : 'Make Admin'}
        </button>

        {/* Admins are exempt from moderation — the server rejects it too, so
            this keeps the UI honest rather than offering a doomed action. */}
        {!host.is_super_admin && status !== 'deleted' && (
          <button onClick={() => openAction(host, status === 'restricted' ? 'unrestrict' : 'restrict')} style={btn(status === 'restricted' ? neutral : warn)}>
            {status === 'restricted' ? 'Unrestrict' : 'Restrict'}
          </button>
        )}

        {!host.is_super_admin && (
          <button onClick={() => openAction(host, status === 'deleted' ? 'restore' : 'delete')} style={btn(status === 'deleted' ? neutral : danger)}>
            {status === 'deleted' ? 'Restore' : 'Delete'}
          </button>
        )}

        {/* Only offered once an account is already soft-deleted, so purging is
            always a deliberate second step rather than one misclick. */}
        {!host.is_super_admin && status === 'deleted' && (
          <button onClick={() => openAction(host, 'purge')} style={btn(danger)}>
            Delete permanently
          </button>
        )}
      </div>
    )
  }

  // ── Events helpers ────────────────────────────────────────────────────────

  function toggleEventSort(key: keyof AdminEvent) {
    if (eventSortKey === key) setEventSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setEventSortKey(key); setEventSortDir('desc') }
  }

  const filteredEvents = events
    .filter(e => {
      const q = eventSearch.toLowerCase()
      const host = hosts.find(h => h.id === e.host_id)
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location ?? '').toLowerCase().includes(q) ||
        (e.category ?? '').toLowerCase().includes(q) ||
        (host?.email ?? '').toLowerCase().includes(q) ||
        (host?.full_name ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const av = a[eventSortKey] ?? ''; const bv = b[eventSortKey] ?? ''
      return (eventSortDir === 'asc' ? 1 : -1) * (av < bv ? -1 : av > bv ? 1 : 0)
    })

  // ── Shared styles ─────────────────────────────────────────────────────────

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

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: 'overview',  icon: '📊', label: 'Overview'   },
    { id: 'hosts',     icon: '👤', label: 'Hosts'      },
    { id: 'events',    icon: '🎉', label: 'Events'     },
    { id: 'auditlogs', icon: '📋', label: 'Audit Log'  },
  ]

  // ── Analytics computed values ─────────────────────────────────────────────

  const newHostsThisMonth = useMemo(() => {
    const now = new Date()
    return hosts.filter(h => {
      const d = new Date(h.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [hosts])

  const newEventsThisMonth = useMemo(() => {
    const now = new Date()
    return events.filter(e => {
      const d = new Date(e.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [events])

  const monthlyGrowth = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      result.push({
        key,
        label: d.toLocaleDateString('en-GB', { month: 'short' }),
        hosts: hosts.filter(h => h.created_at.startsWith(key)).length,
        events: events.filter(e => e.created_at.startsWith(key)).length,
      })
    }
    return result
  }, [hosts, events])

  const maxMonthlyVal = useMemo(
    () => Math.max(1, ...monthlyGrowth.map(m => Math.max(m.hosts, m.events))),
    [monthlyGrowth]
  )

  const imageCount = useMemo(() => mediaItems.filter(m => m.type === 'image').length, [mediaItems])
  const videoCount = useMemo(() => mediaItems.filter(m => m.type === 'video').length, [mediaItems])
  const totalMedia = imageCount + videoCount

  const topEventsByViews = useMemo(() => {
    const acc: Record<string, number> = {}
    mediaItems.forEach(m => { acc[m.event_id] = (acc[m.event_id] ?? 0) + m.views })
    return Object.entries(acc)
      .map(([event_id, views]) => ({ event_id, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [mediaItems])

  const hostFunnel = useMemo(() => ({
    inactive: hosts.filter(h => h.event_count === 0).length,
    light:    hosts.filter(h => h.event_count >= 1  && h.event_count <= 4).length,
    growth:   hosts.filter(h => h.event_count >= 5  && h.event_count <= 14).length,
    scale:    hosts.filter(h => h.event_count >= 15 && h.event_count <= 49).length,
    active:   hosts.filter(h => h.event_count >= 50).length,
  }), [hosts])

  const conversionRate = useMemo(() =>
    hosts.length > 0
      ? ((hosts.filter(h => h.event_count > 0).length / hosts.length) * 100).toFixed(0)
      : '0'
  , [hosts])

  const recentSignups = useMemo(() =>
    [...hosts].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5)
  , [hosts])

  // ─────────────────────────────────────────────────────────────────────────

  const topCategory = categories[0] ?? null
  const restCategories = categories.slice(1)
  const maxCount = categories[0]?.count ?? 1

  const statCards = [
    { label: 'Total Hosts',   value: metrics?.total_hosts   ?? 0, icon: '👤', sub: 'registered accounts'  },
    { label: 'Total Events',  value: metrics?.total_events  ?? 0, icon: '🎉', sub: 'events created'        },
    { label: 'Total Uploads', value: metrics?.total_uploads ?? 0, icon: '📸', sub: 'media files'           },
    { label: 'Total Views',   value: metrics?.total_views   ?? 0, icon: '👁',  sub: 'across all feeds'     },
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '4rem' : 0 }}>

      {/* Header */}
      <header className="chrome-surface" style={{
        borderBottom: '1px solid var(--border)',
        paddingLeft: '1rem', paddingRight: '1rem', height: '3.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isMobile ? <ChromeLogo height={26} /> : <ChromeLogo height={32} />}
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            {isMobile ? 'Admin' : 'Super Admin'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Link href="/dashboard" style={{
            height: '2rem', paddingLeft: '0.75rem', paddingRight: '0.75rem',
            borderRadius: '0.5rem', border: '1px solid var(--border)',
            backgroundColor: 'var(--btn-chrome-bg)', color: 'var(--btn-chrome-text)',
            fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            ‹ Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside className="chrome-surface" style={{
            width: '12.5rem',
            borderRight: '1px solid var(--border)',
            padding: '1.25rem 0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0,
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

        {/* Content area */}
        <div style={{ flex: 1, padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease' }}>

              {/* ── 1. Platform totals ── */}
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Platform Totals</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.75rem' }}>
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

              {/* ── 2. This month pulse + conversion ── */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'New Hosts', value: newHostsThisMonth, icon: '🆕', sub: 'this month' },
                  { label: 'New Events', value: newEventsThisMonth, icon: '✨', sub: 'this month' },
                  { label: 'Conversion', value: `${conversionRate}%`, icon: '🎯', sub: 'hosts with ≥1 event' },
                  { label: 'Host Activity', value: `${hostFunnel.active}`, icon: '⚡', sub: 'hosts with 50+ events' },
                ].map(card => (
                  <div key={card.label} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: isMobile ? '0.875rem' : '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
                      <span style={{ fontSize: '1rem' }}>{card.icon}</span>
                    </div>
                    <p style={{ color: 'var(--accent)', fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{card.value}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: 0 }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── 3. Growth chart — last 6 months ── */}
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Growth — Last 6 Months</p>
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
                    {[{ color: 'var(--accent)', label: 'New Hosts' }, { color: 'rgba(85,107,47,0.35)', label: 'New Events' }].map(l => (
                      <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div style={{ width: '0.625rem', height: '0.625rem', backgroundColor: l.color, borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? '0.25rem' : '0.5rem', height: '7rem' }}>
                    {monthlyGrowth.map(m => {
                      const hostH = maxMonthlyVal > 0 ? (m.hosts / maxMonthlyVal) * 5.5 : 0
                      const evtH  = maxMonthlyVal > 0 ? (m.events / maxMonthlyVal) * 5.5 : 0
                      return (
                        <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <div style={{ flex: 1, maxWidth: '1.125rem', height: `${hostH}rem`, minHeight: m.hosts > 0 ? '3px' : '0', backgroundColor: 'var(--accent)', borderRadius: '3px 3px 0 0' }} title={`${m.hosts} hosts`} />
                            <div style={{ flex: 1, maxWidth: '1.125rem', height: `${evtH}rem`, minHeight: m.events > 0 ? '3px' : '0', backgroundColor: 'rgba(85,107,47,0.4)', borderRadius: '3px 3px 0 0' }} title={`${m.events} events`} />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600, margin: 0 }}>{m.label}</p>
                            {!isMobile && (
                              <p style={{ fontSize: '0.55rem', color: 'var(--text-dim)', margin: '0.1rem 0 0', opacity: 0.7 }}>{m.hosts}/{m.events}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── 4. Engagement ratios ── */}
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

              {/* ── 5. Host engagement funnel ── */}
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Host Engagement Funnel</p>
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Inactive',       sub: '0 events created', count: hostFunnel.inactive, color: 'rgba(239,68,68,0.5)' },
                    { label: 'Getting started', sub: '1–4 events',      count: hostFunnel.light,    color: 'rgba(234,179,8,0.6)' },
                    { label: 'Growth stage',    sub: '5–14 events',     count: hostFunnel.growth,   color: 'rgba(59,130,246,0.6)' },
                    { label: 'Scale stage',     sub: '15–49 events',    count: hostFunnel.scale,    color: 'rgba(168,85,247,0.6)' },
                    { label: 'Power users',     sub: '50+ events',      count: hostFunnel.active,   color: 'var(--accent)' },
                  ].map(tier => {
                    const pct = hosts.length > 0 ? (tier.count / hosts.length) * 100 : 0
                    return (
                      <div key={tier.label}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tier.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{tier.sub}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{tier.count}</span>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: tier.color, borderRadius: '999px', width: `${pct}%`, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── 6. Media breakdown + top events by views ── */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>

                {/* Media type split */}
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.875rem', fontSize: '0.925rem', fontWeight: 700 }}>Media Breakdown</h4>
                  {totalMedia > 0 ? (
                    <>
                      <div style={{ display: 'flex', gap: '0.5rem', height: '1.5rem', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.875rem' }}>
                        <div style={{ flex: imageCount, backgroundColor: 'var(--accent)', transition: 'flex 0.4s ease', minWidth: imageCount > 0 ? '4px' : 0 }} title={`${imageCount} images`} />
                        <div style={{ flex: videoCount, backgroundColor: 'rgba(85,107,47,0.35)', transition: 'flex 0.4s ease', minWidth: videoCount > 0 ? '4px' : 0 }} title={`${videoCount} videos`} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                        {[
                          { label: 'Images 📷', count: imageCount, color: 'var(--accent)' },
                          { label: 'Videos 🎥', count: videoCount, color: 'rgba(85,107,47,0.6)' },
                        ].map(t => (
                          <div key={t.label} style={{ padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', margin: '0 0 0.25rem', fontWeight: 600 }}>{t.label}</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.375rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{t.count.toLocaleString()}</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: '0.125rem 0 0' }}>{totalMedia > 0 ? ((t.count / totalMedia) * 100).toFixed(0) : 0}% of uploads</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No uploads yet</p>
                  )}
                </div>

                {/* Top events by views */}
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Top Events by Views</h4>
                    <button onClick={() => setActiveSection('events')} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>All →</button>
                  </div>
                  {topEventsByViews.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No views yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {topEventsByViews.map((item, i) => {
                        const ev = events.find(e => e.id === item.event_id)
                        const maxV = topEventsByViews[0].views
                        return ev ? (
                          <div key={item.event_id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: i === 0 ? 'var(--accent)' : 'var(--text-dim)', flexShrink: 0, width: '1rem', textAlign: 'center' }}>#{i+1}</span>
                              <p style={{ color: 'var(--text-primary)', fontSize: '0.825rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ev.title}</p>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{item.views.toLocaleString()}</span>
                            </div>
                            <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden', marginLeft: '1.5rem' }}>
                              <div style={{ height: '100%', backgroundColor: i === 0 ? 'var(--accent)' : 'rgba(85,107,47,0.4)', borderRadius: '999px', width: `${(item.views / maxV) * 100}%` }} />
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ── 7. Top hosts by uploads ── */}
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Top Hosts by Uploads</h4>
                  <button onClick={() => setActiveSection('hosts')} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {[...hosts].sort((a, b) => b.upload_count - a.upload_count).slice(0, 5).map((host, i) => (
                    <div key={host.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: i === 0 ? 'var(--accent)' : 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: i === 0 ? '#F7E7CE' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.full_name ?? host.email.split('@')[0]}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{host.event_count} events · {host.total_views.toLocaleString()} views</p>
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>{host.upload_count} uploads</span>
                    </div>
                  ))}
                  {hosts.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No hosts yet</p>}
                </div>
              </div>

              {/* ── 8. Recent signups ── */}
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Recent Signups</h4>
                  <button onClick={() => setActiveSection('hosts')} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {recentSignups.map(host => (
                    <div key={host.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'rgba(85,107,47,0.15)', border: '1px solid rgba(85,107,47,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
                        {(host.full_name ?? host.email)[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.full_name ?? host.email.split('@')[0]}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.email}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', margin: 0 }}>{formatTimeAgo(host.created_at)}</p>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: '0.125rem 0 0' }}>{host.event_count} event{host.event_count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                  {hosts.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No signups yet</p>}
                </div>
              </div>

              {/* ── 9. Event categories ── */}
              {categories.length > 0 && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>Event Categories</p>
                  {topCategory && (
                    <div style={{ backgroundColor: 'var(--accent)', borderRadius: '1rem', padding: isMobile ? '1.125rem' : '1.5rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: '-1rem', top: '-1rem', fontSize: '6rem', opacity: 0.15, lineHeight: 1 }}>{categoryEmojis[topCategory.category] ?? '🏆'}</div>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ backgroundColor: 'rgba(247,231,206,0.2)', color: '#F7E7CE', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(247,231,206,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>🏆 Top Category</span>
                        <p style={{ color: '#F7E7CE', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, margin: '0.375rem 0 0', letterSpacing: '-0.02em' }}>{categoryEmojis[topCategory.category] ?? ''} {topCategory.category}</p>
                        <p style={{ color: 'rgba(247,231,206,0.75)', fontSize: '0.825rem', margin: '0.25rem 0 0' }}>{topCategory.count} event{topCategory.count !== 1 ? 's' : ''} · {((topCategory.count / (metrics?.total_events ?? 1)) * 100).toFixed(0)}% of all events</p>
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

              {/* ── 10. Recent events ── */}
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.925rem', fontWeight: 700 }}>Recent Events</h4>
                  <button onClick={() => setActiveSection('events')} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {events.slice(0, 5).map(ev => {
                    const host = hosts.find(h => h.id === ev.host_id)
                    return (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{categoryEmojis[ev.category ?? ''] ?? '🎉'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{host?.full_name ?? host?.email.split('@')[0] ?? 'Unknown host'} · {formatTimeAgo(ev.created_at)}</p>
                        </div>
                        <Link href={`/e/${ev.slug}`} target="_blank" style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>View →</Link>
                      </div>
                    )
                  })}
                  {events.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No events yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── HOSTS ────────────────────────────────────────────────────── */}
          {activeSection === 'hosts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700 }}>Host Management</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
                    {filteredHosts.length} of {hosts.length} hosts
                    {deletedHostCount > 0 && ` · ${deletedHostCount} deleted`}
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={hostSearch}
                  onChange={e => setHostSearch(e.target.value)}
                  style={{ width: isMobile ? '100%' : '16.25rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              {/* Mobile cards */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {filteredHosts.length === 0 && (
                    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '2.5rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No hosts found</p>
                    </div>
                  )}
                  {filteredHosts.map(host => (
                    <div key={host.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.925rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.full_name ?? 'Unnamed'}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0.125rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.email}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                          {hostStatus(host) !== 'active' && <StatusBadge host={host} />}
                          {host.is_super_admin
                            ? <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: '#6a8f3a', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.4)', whiteSpace: 'nowrap' }}>Admin</span>
                            : <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Host</span>
                          }
                        </div>
                      </div>

                      {(host.restricted_reason || host.deletion_reason) && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.625rem', fontStyle: 'italic' }}>
                          {host.deletion_reason ?? host.restricted_reason}
                        </p>
                      )}
                      {host.purge_after && (
                        <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0 0 0.625rem', fontWeight: 600 }}>
                          Purges in {daysUntil(host.purge_after)} days
                        </p>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.625rem', marginBottom: '0.625rem' }}>
                        {[{ label: 'Events', value: host.event_count }, { label: 'Uploads', value: host.upload_count }, { label: 'Views', value: host.total_views.toLocaleString() }].map(stat => (
                          <div key={stat.label} style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>{stat.value}</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', margin: '0.1rem 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      {renderAccountActions(host, true)}
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop table */
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '50rem' }}>
                      <thead>
                        <tr>
                          <th style={thStyle} onClick={() => toggleHostSort('full_name')}>Name <SortIcon<HostStat> col="full_name" sortKey={hostSortKey} sortDir={hostSortDir} /></th>
                          <th style={thStyle} onClick={() => toggleHostSort('email')}>Email <SortIcon<HostStat> col="email" sortKey={hostSortKey} sortDir={hostSortDir} /></th>
                          <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleHostSort('event_count')}>Events <SortIcon<HostStat> col="event_count" sortKey={hostSortKey} sortDir={hostSortDir} /></th>
                          <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleHostSort('upload_count')}>Uploads <SortIcon<HostStat> col="upload_count" sortKey={hostSortKey} sortDir={hostSortDir} /></th>
                          <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => toggleHostSort('total_views')}>Views <SortIcon<HostStat> col="total_views" sortKey={hostSortKey} sortDir={hostSortDir} /></th>
                          <th style={thStyle} onClick={() => toggleHostSort('created_at')}>Joined <SortIcon<HostStat> col="created_at" sortKey={hostSortKey} sortDir={hostSortDir} /></th>
                          <th style={{ ...thStyle, textAlign: 'center' }}>Role</th>
                          <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                          <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHosts.length === 0 && (
                          <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No hosts found</td></tr>
                        )}
                        {filteredHosts.map((host, i) => (
                          <tr key={host.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                            <td style={tdStyle}><p style={{ margin: 0, fontWeight: 600 }}>{host.full_name ?? 'Unnamed'}</p></td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.825rem' }}>{host.email}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.event_count}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.upload_count}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{host.total_views.toLocaleString()}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatTimeAgo(host.created_at)}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              {host.is_super_admin
                                ? <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: '#6a8f3a', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.4)', whiteSpace: 'nowrap' }}>Admin</span>
                                : <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Host</span>
                              }
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <StatusBadge host={host} />
                              {host.purge_after && (
                                <p style={{ color: '#ef4444', fontSize: '0.7rem', margin: '0.25rem 0 0', fontWeight: 600 }}>
                                  Purges in {daysUntil(host.purge_after)}d
                                </p>
                              )}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              {renderAccountActions(host, false)}
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

          {/* ── EVENTS ───────────────────────────────────────────────────── */}
          {activeSection === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700 }}>All Events</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>{filteredEvents.length} of {events.length} events</p>
                </div>
                <input
                  type="text"
                  placeholder="Search title, host, category..."
                  value={eventSearch}
                  onChange={e => setEventSearch(e.target.value)}
                  style={{ width: isMobile ? '100%' : '18rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              {/* Mobile cards */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {filteredEvents.length === 0 && (
                    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '2.5rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No events found</p>
                    </div>
                  )}
                  {filteredEvents.map(ev => {
                    const host = hosts.find(h => h.id === ev.host_id)
                    return (
                      <div key={ev.id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.625rem' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                              <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.925rem', margin: 0 }}>{ev.title}</p>
                              {ev.category && <span style={{ backgroundColor: 'rgba(85,107,47,0.15)', color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)', whiteSpace: 'nowrap' }}>{categoryEmojis[ev.category] ?? ''} {ev.category}</span>}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: '0.25rem 0 0' }}>{host?.full_name ?? host?.email.split('@')[0] ?? 'Unknown'}</p>
                          </div>
                          <Link href={`/e/${ev.slug}`} target="_blank" style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>View →</Link>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                          {ev.event_date && <span>📅 {formatEventDate(ev.event_date)}</span>}
                          {ev.location && <span>📍 {ev.location}</span>}
                          <span>Created {formatTimeAgo(ev.created_at)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Desktop table */
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '52rem' }}>
                      <thead>
                        <tr>
                          <th style={thStyle} onClick={() => toggleEventSort('title')}>Event <SortIcon<AdminEvent> col="title" sortKey={eventSortKey} sortDir={eventSortDir} /></th>
                          <th style={thStyle}>Host</th>
                          <th style={thStyle} onClick={() => toggleEventSort('category')}>Category <SortIcon<AdminEvent> col="category" sortKey={eventSortKey} sortDir={eventSortDir} /></th>
                          <th style={thStyle} onClick={() => toggleEventSort('event_date')}>Date <SortIcon<AdminEvent> col="event_date" sortKey={eventSortKey} sortDir={eventSortDir} /></th>
                          <th style={thStyle} onClick={() => toggleEventSort('location')}>Location <SortIcon<AdminEvent> col="location" sortKey={eventSortKey} sortDir={eventSortDir} /></th>
                          <th style={thStyle} onClick={() => toggleEventSort('created_at')}>Created <SortIcon<AdminEvent> col="created_at" sortKey={eventSortKey} sortDir={eventSortDir} /></th>
                          <th style={{ ...thStyle, textAlign: 'center' }}>Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.length === 0 && (
                          <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No events found</td></tr>
                        )}
                        {filteredEvents.map((ev, i) => {
                          const host = hosts.find(h => h.id === ev.host_id)
                          return (
                            <tr key={ev.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                              <td style={tdStyle}>
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</p>
                                <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>/{ev.slug}</p>
                              </td>
                              <td style={{ ...tdStyle }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{host?.full_name ?? 'Unnamed'}</p>
                                <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{host?.email ?? '—'}</p>
                              </td>
                              <td style={tdStyle}>
                                {ev.category
                                  ? <span style={{ backgroundColor: 'rgba(85,107,47,0.15)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)', whiteSpace: 'nowrap' }}>{categoryEmojis[ev.category] ?? ''} {ev.category}</span>
                                  : <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                                }
                              </td>
                              <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                                {ev.event_date ? formatEventDate(ev.event_date) : '—'}
                              </td>
                              <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.825rem', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.location ?? '—'}
                              </td>
                              <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatTimeAgo(ev.created_at)}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <Link href={`/e/${ev.slug}`} target="_blank" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View →</Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AUDIT LOG ────────────────────────────────────────────────── */}
          {activeSection === 'auditlogs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700 }}>Audit Log</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>Last {auditLogs.length} platform events</p>
                </div>
                <button
                  onClick={() => { setAuditLoaded(false); setAuditLogs([]); loadAuditLogs() }}
                  disabled={auditLoading}
                  style={{ height: '2rem', paddingLeft: '0.875rem', paddingRight: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: auditLoading ? 'not-allowed' : 'pointer', opacity: auditLoading ? 0.6 : 1 }}
                >
                  {auditLoading ? 'Refreshing...' : '↻ Refresh'}
                </button>
              </div>

              {auditLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Loading audit log...</p>
                </div>
              )}

              {!auditLoading && auditLogs.length === 0 && (
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No audit events recorded yet</p>
                </div>
              )}

              {!auditLoading && auditLogs.length > 0 && (
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.875rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 'auto' : '42rem' }}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, cursor: 'default' }}>Event</th>
                          <th style={{ ...thStyle, cursor: 'default' }}>User</th>
                          {!isMobile && <th style={{ ...thStyle, cursor: 'default' }}>IP</th>}
                          {!isMobile && <th style={{ ...thStyle, cursor: 'default' }}>Metadata</th>}
                          <th style={{ ...thStyle, cursor: 'default', whiteSpace: 'nowrap' }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log, i) => (
                          <tr key={log.id ?? i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{auditIcons[log.event_type] ?? '📝'}</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{log.event_type}</span>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              {log.user_email
                                ? <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '12rem' }}>{log.user_email}</p>
                                : <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                              }
                            </td>
                            {!isMobile && (
                              <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                                {log.ip_address ?? '—'}
                              </td>
                            )}
                            {!isMobile && (
                              <td style={{ ...tdStyle, fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '16rem' }}>
                                {log.metadata
                                  ? <span style={{ fontFamily: 'monospace', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{JSON.stringify(log.metadata)}</span>
                                  : <span style={{ color: 'var(--text-dim)' }}>—</span>
                                }
                              </td>
                            )}
                            <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                              {formatTimeAgo(log.created_at)}
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

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav className="chrome-surface" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '4rem',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch', zIndex: 40,
        }}>
          {navItems.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeSection === id ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                borderTop: activeSection === id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      )}

      {!isMobile && <Footer variant="minimal" />}

      {/* ── Account action confirmation ───────────────────────────────── */}
      {pendingAction && (() => {
        const { host, action } = pendingAction
        const name = host.full_name ?? host.email
        const copy = {
          restrict: {
            title: 'Restrict account',
            body: `${name} will be signed out and locked out of their dashboard, and all ${host.event_count} of their event feeds will stop accepting and showing uploads. Nothing is deleted — you can undo this at any time.`,
            confirm: 'Restrict', danger: false, reason: true,
          },
          unrestrict: {
            title: 'Lift restriction',
            body: `${name} will be able to sign in again, and their event feeds will go back live.`,
            confirm: 'Unrestrict', danger: false, reason: false,
          },
          delete: {
            title: 'Delete account',
            body: `${name} will be signed out and locked out, and their feeds go offline immediately. Their ${host.event_count} events and ${host.upload_count} uploads will be permanently erased in 30 days — until then you can restore them.`,
            confirm: 'Delete', danger: true, reason: true,
          },
          restore: {
            title: 'Restore account',
            body: `${name} will be able to sign in again, their feeds go back live, and the scheduled purge of their ${host.upload_count} uploads is cancelled.`,
            confirm: 'Restore', danger: false, reason: false,
          },
          purge: {
            title: 'Delete permanently — right now',
            body: `This erases ${name}'s account immediately instead of waiting for the purge date: ${host.event_count} events and ${host.upload_count} photos and videos are deleted from Cloudinary and the database, along with their login. This cannot be undone, and they cannot be restored afterwards.`,
            confirm: 'Delete permanently', danger: true, reason: false,
          },
        }[action]

        return (
          <div
            onClick={() => !actionLoading && setPendingAction(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <div
              className="chrome-surface"
              onClick={e => e.stopPropagation()}
              style={{ border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
            >
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem', fontWeight: 700 }}>{copy.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{copy.body}</p>

              {copy.reason && (
                <div>
                  <label htmlFor="action-reason" style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Reason <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional — included in the email)</span>
                  </label>
                  <textarea
                    id="action-reason"
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. Repeated uploads violating our content policy"
                    // --text-on-input, not --text-primary: this sits on a
                    // .chrome-surface, where --text-primary is the cream meant
                    // for text directly on the olive and would vanish in the
                    // field's own light background.
                    style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.625rem 0.75rem', color: 'var(--text-on-input)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              )}

              <p style={{ color: 'var(--text-dim)', fontSize: '0.775rem', margin: 0 }}>
                {action === 'restore' || action === 'purge'
                  ? `No email is sent — ${name} was already notified when the account was ${action === 'purge' ? 'deleted' : 'restricted'}.`
                  : `${name} will be emailed and told to contact support@sharemomento.app.`}
              </p>

              {actionError && (
                <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{actionError}</p>
              )}

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  onClick={() => setPendingAction(null)}
                  disabled={actionLoading}
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', minHeight: '44px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionLoading}
                  style={{ flex: 1, border: `1px solid ${copy.danger ? 'var(--danger-border)' : 'var(--border)'}`, borderRadius: '0.75rem', padding: '0.75rem', fontWeight: 600, color: copy.danger ? 'var(--danger)' : 'var(--accent)', background: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', minHeight: '44px', opacity: actionLoading ? 0.6 : 1 }}
                >
                  {actionLoading ? 'Working...' : copy.confirm}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <ActionToast message={actionToast} onClose={() => setActionToast('')} />
    </main>
  )
}

function ActionToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className="chrome-surface" style={{ position: 'fixed', bottom: '5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1100, border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', maxWidth: 'calc(100vw - 2rem)' }}>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>{message}</p>
    </div>
  )
}
