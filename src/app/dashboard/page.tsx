'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Footer } from '@/components/ui/Footer'
import { LoadingBar } from '@/components/ui/LoadingBar'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

type Event = {
  id: string
  title: string
  slug: string
  description: string | null
  location: string | null
  event_date: string | null
  event_time: string | null
  category: string | null
  created_at: string
}

const EVENT_CATEGORIES = [
  'Wedding', 'Birthday', 'Anniversary', 'Engagement',
  'Graduation', 'Baby Shower', 'Corporate', 'Conference',
  'Concert', 'Festival', 'Reunion', 'Other'
]


const categoryEmojis: Record<string, string> = {
  Wedding: '💍', Birthday: '🎂', Anniversary: '🥂', Engagement: '💌',
  Graduation: '🎓', 'Baby Shower': '🍼', Corporate: '💼', Conference: '🎤',
  Concert: '🎵', Festival: '🎊', Reunion: '🤝', Other: '📌',
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [totalUploads, setTotalUploads] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [showCategoryPanel, setShowCategoryPanel] = useState(false)
  const { isMobile } = useWindowWidth()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const user = session.user

      const { data: host } = await supabase.from('hosts').select('is_super_admin').eq('id', user.id).single()
      if (host?.is_super_admin) setIsAdmin(true)

      const { data: eventsData } = await supabase.from('events').select('*').eq('host_id', user.id).order('created_at', { ascending: false })
      if (eventsData) setEvents(eventsData)

      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id)
        const { data: mediaData } = await supabase.from('media').select('views').in('event_id', eventIds)
        if (mediaData) {
          setTotalUploads(mediaData.length)
          setTotalViews(mediaData.reduce((sum, m) => sum + (m.views ?? 0), 0))
        }
      }

      setPageLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/auth/login')
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  function resetForm() {
    setTitle(''); setDescription(''); setLocation('')
    setEventDate(''); setEventTime(''); setCategory('')
    setCreateError('')
    setShowForm(false)
  }

  async function createEvent() {
    if (!title.trim()) return
    setLoading(true)
    setCreateError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    const slug = generateSlug(title)
    const { data, error } = await supabase
      .from('events')
      .insert({ host_id: session.user.id, title, description, location: location || null, event_date: eventDate || null, event_time: eventTime || null, category: category || null, slug })
      .select().single()
    if (!error && data) {
      setEvents(prev => [data, ...prev])
      resetForm()
      router.push(`/dashboard/${data.id}`)
    } else if (error) {
      setCreateError(error.message)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const usedCategories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean) as string[]))]
  const filteredEvents = activeCategory === 'All' ? events : events.filter(e => e.category === activeCategory)

  const input: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '0.75rem', padding: '0.875rem 1rem', color: 'var(--text-primary)',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', minHeight: '52px',
  }

  if (pageLoading) return (
    <>
      <LoadingBar />
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading your events...</p>
      </main>
    </>
  )

  const createForm = (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem', fontWeight: 700 }}>New event</h3>
        <button onClick={resetForm} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Event title *</label>
          <input type="text" placeholder="Enter event title" value={title} onChange={e => setTitle(e.target.value)} style={input} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...input, appearance: 'none' as React.CSSProperties['appearance'] }}>
            <option value="">Select...</option>
            {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Location</label>
          <input type="text" placeholder="e.g. The Ritz Carlton, Toronto" value={location} onChange={e => setLocation(e.target.value)} style={input} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '0.625rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Date</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ ...input, colorScheme: 'dark', cursor: 'pointer', paddingLeft: '0.75rem', paddingRight: '0.25rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Time</label>
            <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} style={{ ...input, colorScheme: 'dark', cursor: 'pointer', paddingLeft: '0.75rem', paddingRight: '0.25rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Description</label>
          <textarea placeholder="Tell guests what to expect..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...input, minHeight: 'unset', resize: 'none' }} />
        </div>
        {createError && (
          <p style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.825rem', border: '1px solid rgba(239,68,68,0.2)', margin: 0 }}>{createError}</p>
        )}
        <div style={{ display: 'flex', gap: '0.625rem', paddingTop: '0.25rem' }}>
          <button onClick={createEvent} disabled={loading || !title.trim()} style={{ flex: 1, backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading || !title.trim() ? 0.4 : 1 }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><span style={{ width: '16px', height: '16px', border: '2px solid rgba(247,231,206,0.3)', borderTopColor: '#F7E7CE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Creating...</span>
              : 'Create event'
            }
          </button>
          <button onClick={resetForm} style={{ padding: '0.875rem 1.25rem', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px' }}>Cancel</button>
        </div>
      </div>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {loading && <LoadingBar />}

      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, whiteSpace: 'nowrap' }}>My Events</span>
        </div>

        {isMobile ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ height: '36px', width: '36px', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '44px', right: 0, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.375rem', display: 'flex', flexDirection: 'column', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 50 }}>
                <div style={{ padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Theme</span>
                  <ThemeToggle />
                </div>
                {isAdmin && (
                  <>
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.25rem 0' }} />
                    <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ padding: '0.625rem 0.875rem', borderRadius: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                      ⚙ Admin
                    </Link>
                  </>
                )}
                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.25rem 0' }} />
                <button onClick={() => { setMenuOpen(false); handleSignOut() }} style={{ padding: '0.625rem 0.875rem', borderRadius: '0.5rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            {isAdmin && (
              <Link href="/admin" style={{ height: '32px', paddingLeft: '0.625rem', paddingRight: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                ⚙ Admin
              </Link>
            )}
            <button onClick={handleSignOut} style={{ height: '32px', paddingLeft: '0.625rem', paddingRight: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Sign out
            </button>
            <ThemeToggle />
          </div>
        )}
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Stats bar — full width but content centered */}
      {/* Stats bar — full width background, content centered */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', padding: '1.25rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { label: 'EVENTS', value: events.length, icon: '🎉' },
            { label: 'UPLOADS', value: totalUploads, icon: '📸' },
            { label: 'VIEWS', value: totalViews.toLocaleString(), icon: '👁' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                {stat.icon} {stat.label}
              </p>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Boxed content area — visually distinct on desktop */}
      <div style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-base)', borderRadius: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}>

          {/* Category management */}
          {usedCategories.length > 1 && (
            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div
                style={{ padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setShowCategoryPanel(v => !v)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1rem' }}>🗂</span>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.925rem', margin: 0 }}>Categories</p>
                  <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)' }}>
                    {usedCategories.length - 1}
                  </span>
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem', display: 'inline-block', transform: showCategoryPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
              </div>

              <div style={{ padding: '0 1.125rem 0.875rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {usedCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ height: '32px', paddingLeft: '0.75rem', paddingRight: '0.75rem', borderRadius: '999px', border: '1px solid var(--border)', backgroundColor: activeCategory === cat ? 'var(--accent)' : 'var(--bg-input)', color: activeCategory === cat ? '#F7E7CE' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {cat === 'All' ? 'All' : `${categoryEmojis[cat] ?? ''} ${cat}`}
                    <span style={{ marginLeft: '0.25rem', opacity: 0.7, fontSize: '0.725rem' }}>
                      {cat === 'All' ? events.length : events.filter(e => e.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>

              {showCategoryPanel && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.875rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {usedCategories.filter(c => c !== 'All').map(cat => {
                    const count = events.filter(e => e.category === cat).length
                    const pct = Math.round((count / events.length) * 100)
                    return (
                      <div key={cat} onClick={() => setActiveCategory(cat)} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', border: '1px solid var(--border)', backgroundColor: activeCategory === cat ? 'rgba(85,107,47,0.1)' : 'var(--bg-input)', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{categoryEmojis[cat] ?? '📌'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{cat}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', margin: 0, flexShrink: 0 }}>{count} event{count !== 1 ? 's' : ''} · {pct}%</p>
                          </div>
                          <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: activeCategory === cat ? 'var(--accent)' : 'var(--accent-faint)', borderRadius: '999px', width: `${pct}%`, opacity: activeCategory === cat ? 1 : 0.5, transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                        {activeCategory === cat && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>✓</span>}
                      </div>
                    )
                  })}
                  {activeCategory !== 'All' && (
                    <button onClick={() => setActiveCategory('All')} style={{ marginTop: '0.25rem', padding: '0.5rem', border: 'none', background: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                      Clear filter — show all events
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* New event form — full width, top priority when open */}
          {showForm && (
            <div style={{ width: '100%' }}>
              {createForm}
            </div>
          )}

          {/* Events list — below form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0 }}>
                {filteredEvents.length} {activeCategory !== 'All' ? activeCategory : ''} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
              {!showForm && (
                <button onClick={() => setShowForm(true)} style={{ height: '36px', paddingLeft: '1rem', paddingRight: '1rem', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  + New event
                </button>
              )}
            </div>

            {filteredEvents.length === 0 && !showForm && (
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px dashed var(--border)', padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{activeCategory !== 'All' ? (categoryEmojis[activeCategory] ?? '🎉') : '🎉'}</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', fontWeight: 600, margin: 0 }}>
                  {activeCategory !== 'All' ? `No ${activeCategory} events yet` : 'No events yet'}
                </p>
                {activeCategory === 'All' && (
                  <button onClick={() => setShowForm(true)} style={{ marginTop: '0.5rem', height: '44px', paddingLeft: '1.25rem', paddingRight: '1.25rem', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.925rem', fontWeight: 600 }}>
                    + Create event
                  </button>
                )}
              </div>
            )}

            {filteredEvents.map(event => (
              <Link key={event.id} href={`/dashboard/${event.id}`} style={{ display: 'block', backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.125rem', border: '1px solid var(--border)', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>{event.title}</h4>
                      {event.category && (
                        <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)', whiteSpace: 'nowrap' }}>
                          {categoryEmojis[event.category] ?? ''} {event.category}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginTop: '0.375rem' }}>
                      {event.event_date && <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>📅 {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {event.location && <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>📍 {event.location}</span>}
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.775rem', marginTop: '0.375rem' }}>/{event.slug}</p>
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '1.125rem', flexShrink: 0 }}>→</span>
                </div>
              </Link>
            ))}
          </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}