import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { SITE_URL } from './data'

export function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [pos, setPos] = useState(50)

  const updateFromClientX = (clientX: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (dragging.current) updateFromClientX(e.clientX) }
    const onUp = () => { dragging.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [])

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => { dragging.current = true; updateFromClientX(e.clientX) }

  return <div className="ba-slider" ref={ref} onPointerDown={onDown} role="slider" aria-label="Jämför före och efter städning" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5)); if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5)) }}>
    <img src={after} alt="Efter städning" width={950} height={630} loading="lazy" />
    <div className="ba-before-wrap" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}><img src={before} alt="Före städning" width={950} height={630} loading="lazy" /></div>
    <div className="ba-handle" style={{ left: `${pos}%` }}><span className="ba-handle-grip">↔</span></div>
    <span className="ba-label ba-label-before">Före</span>
    <span className="ba-label ba-label-after">Efter</span>
  </div>
}

export function AiBadge({ children }: { children: ReactNode }) {
  return <span className="ai-badge">
    <svg className="ai-badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="aiGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" className="ai-grad-a" /><stop offset="50%" className="ai-grad-b" /><stop offset="100%" className="ai-grad-c" />
      </linearGradient></defs>
      <path d="M12 2L13.6 9.4L21 11L13.6 12.6L12 20L10.4 12.6L3 11L10.4 9.4Z" fill="url(#aiGrad)" />
    </svg>
    {children}
  </span>
}
// Sets the tab title, meta description and per-page canonical link for a route.
export function Seo({ title, description, path }: { title: string; description: string; path: string }) {
  useEffect(() => {
    document.title = title
    const url = `${SITE_URL}${path}`
    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute(attr, value)
    }
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [title, description, path])
  return null
}
