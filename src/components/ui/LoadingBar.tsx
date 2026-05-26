'use client'

export function LoadingBar() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 100, overflow: 'hidden', backgroundColor: 'rgba(85,107,47,0.2)' }}>
      <div style={{ height: '100%', backgroundColor: 'var(--accent)', animation: 'loadingBar 1.2s ease-in-out infinite', width: '40%' }} />
    </div>
  )
}