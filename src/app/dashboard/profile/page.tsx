'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LoadingBar } from '@/components/ui/LoadingBar'
import { GreenLogo, GreenLogoSm } from '@/components/landing/Logo'
import { useWindowWidth } from '@/lib/hooks/useWindowWidth'

type AccountType = 'individual' | 'company'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
  'Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei',
  'Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde',
  'Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica',
  'Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea',
  'Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia',
  'Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein',
  'Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta',
  'Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco',
  'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia',
  'Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay',
  'Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa',
  'San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles',
  'Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname',
  'Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
  'Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen',
  'Zambia','Zimbabwe',
]

export default function ProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { isMobile } = useWindowWidth()

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const user = session.user

      setEmail(user.email ?? '')

      const { data: host } = await supabase
        .from('hosts')
        .select('first_name, last_name, company_name, account_type, country')
        .eq('id', user.id)
        .single()

      if (host) {
        setFirstName(host.first_name ?? '')
        setLastName(host.last_name ?? '')
        setCompanyName(host.company_name ?? '')
        setAccountType((host.account_type as AccountType) ?? 'individual')
        setCountry(host.country ?? '')
      }
      setPageLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/auth/login')
    })
    return () => subscription.unsubscribe()
  }, [router, supabase])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return }

    const { error: err } = await supabase
      .from('hosts')
      .update({
        first_name:   firstName.trim(),
        last_name:    lastName.trim(),
        company_name: accountType === 'company' ? companyName.trim() : null,
        account_type: accountType,
        full_name:    accountType === 'company'
          ? companyName.trim()
          : `${firstName.trim()} ${lastName.trim()}`.trim(),
        country: country || null,
      })
      .eq('id', session.user.id)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const input: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '0.75rem', padding: '0.875rem 1rem', color: 'var(--text-primary)',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', minHeight: '52px',
  }

  if (pageLoading) return (
    <>
      <LoadingBar />
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    </>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {saving && <LoadingBar />}

      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Link href="/dashboard" style={{ height: '32px', paddingLeft: '0.75rem', paddingRight: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          {isMobile ? <GreenLogoSm /> : <GreenLogo />}
        </div>
        <ThemeToggle />
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700 }}>My Profile</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Update your display name and country</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Email — read only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Email address</label>
              <div style={{ ...input, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'default', opacity: 0.7 }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{email}</span>
                <span style={{ backgroundColor: 'rgba(85,107,47,0.15)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(85,107,47,0.3)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                  Verified
                </span>
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Account type */}
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Account type</label>
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-input)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                {(['individual', 'company'] as const).map(type => (
                  <button key={type} onClick={() => setAccountType(type)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 700, backgroundColor: accountType === type ? 'var(--accent)' : 'transparent', color: accountType === type ? '#F7E7CE' : 'var(--text-muted)' }}>
                    {type === 'individual' ? '👤 Individual' : '🏢 Company / Org'}
                  </button>
                ))}
              </div>
            </div>

            {accountType === 'company' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Company / Organisation name</label>
                <input type="text" placeholder="Acme Events Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} maxLength={200} style={input} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
                  {accountType === 'company' ? 'Contact first name' : 'First name'}
                </label>
                <input type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} maxLength={100} style={input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
                  {accountType === 'company' ? 'Contact last name' : 'Last name'}
                </label>
                <input type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} maxLength={100} style={input} />
              </div>
            </div>

            {/* Country */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{ ...input, appearance: 'none' as any, cursor: 'pointer', colorScheme: 'dark' }}
              >
                <option value="">Select your country...</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.75rem 1rem', borderRadius: '0.625rem' }}>
                {error}
              </p>
            )}

            {saved && (
              <p style={{ color: 'var(--accent)', fontSize: '0.875rem', margin: 0, backgroundColor: 'rgba(85,107,47,0.1)', padding: '0.75rem 1rem', borderRadius: '0.625rem', fontWeight: 600 }}>
                ✓ Profile saved successfully
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: 'var(--accent)', color: '#F7E7CE', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '1rem', minHeight: '52px', opacity: saving ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {saving ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(247,231,206,0.3)', borderTopColor: '#F7E7CE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Saving...
                </>
              ) : 'Save changes'}
            </button>
          </div>

          {/* Danger zone */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 700, margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Sign out of Momento</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.775rem', margin: '0.125rem 0 0' }}>You can sign back in any time</p>
              </div>
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}
                style={{ height: '36px', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '0.625rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign out
              </button>
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}