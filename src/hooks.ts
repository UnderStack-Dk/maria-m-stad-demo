import { useEffect, useRef, useState } from 'react'

// Animates a number toward `target` whenever it changes.
export function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)
  useEffect(() => {
    const start = prevRef.current
    const startTime = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(start + (target - start) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else prevRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return display
}

// Adds .in-view to .reveal elements once they enter the viewport.
export function useScrollReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in-view)')
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in-view')); return }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target) }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
