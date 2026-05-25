'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

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
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')

      const { data: host } = await supabase
        .from('hosts')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

      if (host?.is_super_admin) setIsAdmin(true)

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setEvents(data)
    }
    init()
  }, [router, supabase])

  function resetForm() {
    setTitle(''); setDescription(''); setLocation('')
    setEventDate(''); setEventTime(''); setCategory('')
    setShowForm(false)
  }

  async function createEvent() {
    if (!title.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const slug = generateSlug(title)
    const { data, error } = await supabase
      .from('events')
      .insert({
        host_id: user.id, title, description,
        location: location || null,
        event_date: eventDate || null,
        event_time: eventTime || null,
        category: category || null,
        slug,
      })
      .select().single()
    if (!error && data) {
      setEvents(prev => [data, ...prev])
      resetForm()
      router.push(`/dashboard/${data.id}`)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const input: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '52px',
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', width: '100%' }}>
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>My Events</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {isAdmin && (
            <Link
              href="/admin"
              style={{ height: '44px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            style={{ height: '44px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {showForm ? (
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>New event</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Event title *</label>
              <input type="text" placeholder="e.g. Adim & Jonah Wedding" value={title} onChange={e => setTitle(e.target.value)} style={input} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...input, appearance: 'none' }}>
                <option value="">Select a category</option>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Description</label>
              <textarea placeholder="Tell guests what to expect..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...input, minHeight: 'unset', resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Location</label>
              <input type="text" placeholder="e.g. The Ritz, Lagos" value={location} onChange={e => setLocation(e.target.value)} style={input} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Date</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ ...input, colorScheme: 'dark' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Time</label>
                <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} style={{ ...input, colorScheme: 'dark' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button onClick={createEvent} disabled={loading || !title.trim()} style={{ flex: 1, backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px', opacity: loading || !title.trim() ? 0.4 : 1 }}>
                {loading ? 'Creating...' : 'Create event'}
              </button>
              <button onClick={resetForm} style={{ padding: '0.875rem 1.25rem', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-muted)', background: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '52px' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '1rem', padding: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', minHeight: '56px' }}>
            + Create new event
          </button>
        )}

        {events.length === 0 && !showForm && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '3rem 0' }}>
            No events yet. Create your first one above.
          </p>
        )}

        {events.map(event => (
          <Link key={event.id} href={`/dashboard/${event.id}`} style={{ display: 'block', backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.125rem', border: '1px solid var(--border)', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>{event.title}</h4>
                  {event.category && (
                    <span style={{ backgroundColor: 'rgba(85,107,47,0.2)', color: 'var(--accent)', fontSize: '0.725rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)', whiteSpace: 'nowrap' }}>
                      {event.category}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                  {event.event_date && <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>📅 {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  {event.location && <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>📍 {event.location}</span>}
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.825rem', marginTop: '0.375rem' }}>/{event.slug}</p>
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: '1.25rem', flexShrink: 0 }}>›</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}