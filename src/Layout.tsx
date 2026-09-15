import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { COMPANY_PHONE_DISPLAY } from './data'

/** Scrolls to the element matching the URL hash after each navigation, or to the top otherwise. */
export function ScrollToHash() {
  const location = useLocation()
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); return }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])
  return null
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  return <header className="site-header">
    <Link to="/" className="brand" aria-label="Maria M Städ, startsida"><img src="/images/logo.png" alt="Maria M Städ" width={80} height={97} /></Link>
    <button className="menu-button" aria-label="Öppna meny" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i></i><i></i><i></i></button>
    <nav className={menuOpen ? 'open' : ''}>
      <Link onClick={closeMenu} to="/#hem">Hem</Link>
      <Link onClick={closeMenu} to="/tjanster">Tjänster</Link>
      <Link onClick={closeMenu} to="/om">Om oss</Link>
      <Link onClick={closeMenu} to="/#omdomen">Omdömen</Link>
      <Link onClick={closeMenu} to="/#kalkylator">Prisberäkning</Link>
      <Link onClick={closeMenu} to="/#kontakt">Kontakt</Link>
    </nav>
    <a className="phone" href="tel:0732770668">{COMPANY_PHONE_DISPLAY}</a>
    <Link className="button header-cta" to="/#kontakt">Få offert</Link>
  </header>
}

export function FloatingCta() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <Link to="/#kontakt" className={visible ? 'floating-cta visible' : 'floating-cta'} aria-hidden={!visible}>Få offert <span>→</span></Link>
}

export function Footer() {
  return <footer className="footer">
    <div><img src="/images/logo.png" alt="Maria M Städ" width={80} height={97} loading="lazy" /><p>Personlig och professionell städning i Malmö sedan 2019.</p></div>
    <div><b>Snabblänkar</b><Link to="/tjanster">Tjänster</Link><Link to="/om">Om oss</Link><Link to="/#kalkylator">Prisberäkning</Link><Link to="/#kontakt">Kontakt</Link></div>
    <div><b>Kontakt</b><a href="tel:0732770668">{COMPANY_PHONE_DISPLAY}</a><a href="mailto:Maria.m.stadning@gmail.com">Maria.m.stadning@gmail.com</a></div>
    <small>© 2026 Maria M Städ</small>
  </footer>
}
