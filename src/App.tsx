import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react'
import emailjs from '@emailjs/browser'
import './App.css'

const services = [
  ['Hemstädning', 'Regelbunden städning för ett rent och trivsamt hem.'],
  ['Flyttstädning', 'Noggrann städning inför eller efter flytt.'],
  ['Storstädning', 'En grundlig rengöring när hemmet behöver lite extra.'],
  ['Kontorsstädning', 'Professionell städning för kontor och arbetsplatser.'],
  ['Fönsterputs', 'Rena och klara fönster utan krångel.'],
  ['Företagsstädning', 'Flexibla städlösningar för företag och verksamheter.'],
]

// Vad som faktiskt styr en offert: hur många m² en städare hinner med per timme
// för respektive tjänst, samt timpriset. Det ger en verklig uppskattning
// (tid × timpris) istället för ett godtyckligt pris per m².
const HOURLY_RATE = 349 // kr/timme, före RUT-avdrag
const MIN_HOURS_DEFAULT = 2
const jobProfile: Record<string, { m2PerHour: number; minHours: number; rut: boolean }> = {
  'Hemstädning': { m2PerHour: 25, minHours: MIN_HOURS_DEFAULT, rut: true },
  'Flyttstädning': { m2PerHour: 15, minHours: 4, rut: true },
  'Storstädning': { m2PerHour: 18, minHours: 3, rut: true },
  'Kontorsstädning': { m2PerHour: 30, minHours: MIN_HOURS_DEFAULT, rut: false },
  'Fönsterputs': { m2PerHour: 40, minHours: 1, rut: true },
  'Företagsstädning': { m2PerHour: 28, minHours: MIN_HOURS_DEFAULT, rut: false },
}

function estimateQuote(service: string, area: number) {
  const profile = jobProfile[service]
  if (!profile) return null
  const safeArea = Math.max(0, area || 0)
  const rawHours = safeArea / profile.m2PerHour
  const hours = Math.max(profile.minHours, Math.ceil(rawHours * 2) / 2) // avrundat till närmaste halvtimme
  const price = Math.round((hours * HOURLY_RATE) / 10) * 10
  const afterRut = profile.rut ? Math.round((price * 0.5) / 10) * 10 : price
  return { hours, price, afterRut, rutEligible: profile.rut }
}

const reviews = [
  ['Julia Gustafsson', 'Mycket trevlig, pålitlig och effektiv personal. Flexibel bokning och planering.'],
  ['Felicia Airosto', 'Strålande service och städning. Bäddar t.o.m. våran hunds säng och uteplats och är jätteduktig med våra glasdörrar o badrummet. Väldigt uppskattat.'],
]

const areas = ['Centrum', 'Västra Hamnen', 'Limhamn', 'Hyllie', 'Rosengård', 'Oxie', 'Bunkeflostrand']

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined
const COMPANY_EMAIL = 'Maria.m.stadning@gmail.com'

/** Animates a number from its previous value to `target` whenever target changes. */
function useCountUp(target: number, duration = 600) {
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

/** Fades + slides in any element carrying the "reveal" class once it enters the viewport. */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in-view')); return }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target) }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [floatingVisible, setFloatingVisible] = useState(false)
  const [calcService, setCalcService] = useState('Hemstädning')
  const [calcArea, setCalcArea] = useState(65)
  const [scoreVisible, setScoreVisible] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)

  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [postcode, setPostcode] = useState('')
  const [message, setMessage] = useState('')

  useScrollReveal()

  useEffect(() => {
    const onScroll = () => setFloatingVisible(window.scrollY > 640)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = scoreRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setScoreVisible(true); obs.disconnect() } })
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const estimate = useMemo(() => estimateQuote(calcService, calcArea), [calcService, calcArea])

  const scoreDisplay = useCountUp(scoreVisible ? 5 : 0, 1000)
  const priceDisplay = useCountUp(estimate?.price ?? 0, 450)
  const afterRutDisplay = useCountUp(estimate?.afterRut ?? 0, 450)
  const hoursDisplay = useCountUp(estimate?.hours ?? 0, 450)

  const closeMenu = () => setMenuOpen(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!estimate) return
    setFormStatus('sending')

    const templateParams = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      service: calcService,
      area_m2: calcArea,
      postcode: postcode || '–',
      message: message || '–',
      estimated_hours: estimate.hours,
      estimated_price: `${estimate.price} kr`,
      estimated_price_after_rut: estimate.rutEligible ? `${estimate.afterRut} kr` : 'Ej RUT-berättigad',
      to_email: COMPANY_EMAIL,
    }

    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error('EmailJS är inte konfigurerat (VITE_EMAILJS_* saknas).')
      }
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, { publicKey: EMAILJS_PUBLIC_KEY })
      setFormStatus('sent')
    } catch (err) {
      console.error('Kunde inte skicka offertförfrågan:', err)
      setFormStatus('error')
    }
  }

  const resetForm = () => {
    setFormStatus('idle')
    setName(''); setPhone(''); setEmail(''); setPostcode(''); setMessage('')
  }

  const mailtoFallback = estimate ? `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent('Offertförfrågan från hemsidan')}&body=${encodeURIComponent(
    `Namn: ${name}\nTelefon: ${phone}\nE-post: ${email}\nTjänst: ${calcService}\nYta: ${calcArea} m²\nPostnummer: ${postcode || '–'}\nMeddelande: ${message || '–'}\n\nUppskattad tid: ${estimate.hours} h\nUppskattat pris: ${estimate.price} kr${estimate.rutEligible ? ` (${estimate.afterRut} kr efter RUT-avdrag)` : ''}`
  )}` : `mailto:${COMPANY_EMAIL}`

  return <>
    <header className="site-header">
      <a href="#hem" className="brand" aria-label="Maria M Städ, startsida"><img src="/images/logo.png" alt="Maria M Städ" width={80} height={97} /></a>
      <button className="menu-button" aria-label="Öppna meny" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i></i><i></i><i></i></button>
      <nav className={menuOpen ? 'open' : ''}><a onClick={closeMenu} href="#hem">Hem</a><a onClick={closeMenu} href="#tjanster">Tjänster</a><a onClick={closeMenu} href="#om-oss">Om oss</a><a onClick={closeMenu} href="#omdomen">Omdömen</a><a onClick={closeMenu} href="#kalkylator">Prisberäkning</a><a onClick={closeMenu} href="#kontakt">Kontakt</a></nav>
      <a className="phone" href="tel:0732770668">073-277 06 68</a><a className="button header-cta" href="#kontakt">Få offert</a>
    </header>
    <main>
      <section className="hero" id="hem"><div className="hero-copy"><p className="eyebrow">STÄDFIRMA I MALMÖ</p><h1>Professionell städning <em>med omtanke.</em></h1><p className="lead">Hemstädning, flyttstädning och företagsstädning med personlig service sedan 2019.</p><div className="actions"><a className="button" href="#kontakt">Få en kostnadsfri offert <span>→</span></a><a className="text-link" href="#tjanster">Se våra tjänster</a></div><div className="hero-trust"><span>5.0 i kundomdömen</span><span>RUT-avdrag</span><span>Sedan 2019</span></div></div><div className="hero-image"><img src="/images/hero.jpg" alt="Professionell städning i hemmet" width={1200} height={1460} fetchPriority="high" /><div className="image-note"><b>Personlig service</b><small>När det passar dig</small></div></div></section>
      <section className="trust"><span>Trygg städning i Malmö</span><span>•</span><span>Öppet alla dagar 08–21</span><span>•</span><span>Enkelt att boka</span></section>
      <section className="section services" id="tjanster"><div className="section-intro reveal"><p className="eyebrow">VÅRA TJÄNSTER</p><h2>Rent på riktigt, <em>på ditt sätt.</em></h2><p>Oavsett om du behöver hjälp hemma, vid flytt eller på jobbet hittar vi en lösning som passar.</p></div><div className="service-list">{services.map(([name, description], i) => <a href="#kalkylator" className="service reveal" style={{ transitionDelay: `${i * 70}ms` }} key={name}><span className="service-number">0{i + 1}</span><div><h3>{name}</h3><p>{description}</p></div><span className="arrow">↗</span></a>)}</div></section>
      <section className="about section" id="om-oss"><div className="about-image reveal"><img src="/images/about.jpg" alt="Städning med fokus på detaljer" width={900} height={850} loading="lazy" /></div><div className="about-copy reveal"><p className="eyebrow">OM MARIA M STÄD</p><h2>Städning du kan känna dig <em>trygg med.</em></h2><p>Maria M Städ har hjälpt kunder i Malmö sedan 2019. Vi tror att god service sitter i detaljerna: att komma i tid, lyssna på vad du behöver och lämna det riktigt rent efter oss.</p><div className="benefits"><div><b>Noggranna</b><span>Vi ser de små sakerna.</span></div><div><b>Personliga</b><span>En kontakt du kan lita på.</span></div><div><b>Flexibla</b><span>Tider och upplägg som passar.</span></div><div><b>Pålitliga</b><span>Trygg hjälp, varje gång.</span></div></div><a href="#kontakt" className="text-link">Lär känna oss <span>→</span></a></div></section>
      <section className="before-after section"><div className="section-intro reveal"><p className="eyebrow">RESULTATET TALAR</p><h2>Före och <em>efter.</em></h2><p>Dra i reglaget och se skillnaden efter en noggrann städning.</p></div><div className="reveal"><BeforeAfterSlider before="/images/before.jpg" after="/images/after.jpg" /></div></section>
      <section className="reviews section" id="omdomen"><div className="section-intro reveal"><p className="eyebrow">VAD VÅRA KUNDER SÄGER</p><h2>Omsorg som <em>märks.</em></h2></div><div className="review-summary reveal" ref={scoreRef}><b>{scoreDisplay.toFixed(1)}</b><span>i kundomdömen<br/><small>Vi är stolta över varje återkommande kund.</small></span></div><div className="quotes">{reviews.map(([name, quote], i) => <blockquote className="reveal" style={{ transitionDelay: `${i * 90}ms` }} key={name}>“{quote}”<footer>{name}</footer></blockquote>)}</div></section>
      <section className="video-cta reveal" id="kalkylator"><video src="/videos/hero-bg.mp4" autoPlay muted loop playsInline preload="none" poster="/images/hero.jpg" aria-hidden="true" /><div className="video-cta-content"><span className="ai-badge"><svg className="ai-badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="aiGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" className="ai-grad-a" /><stop offset="50%" className="ai-grad-b" /><stop offset="100%" className="ai-grad-c" /></linearGradient></defs><path d="M12 2L13.6 9.4L21 11L13.6 12.6L12 20L10.4 12.6L3 11L10.4 9.4Z" fill="url(#aiGrad)" /></svg>Smart prisuppskattning</span><h2>Beräkna ditt pris <em>direkt.</em></h2><p>Välj tjänst och yta så räknar vi ut en verklig uppskattning utifrån arbetstid och timpris — inget påhittat pris per kvadratmeter.</p><div className="calculator">
        <div className="calc-row"><label>Typ av städning<select value={calcService} onChange={e => setCalcService(e.target.value)}>{services.map(([name]) => <option key={name} value={name}>{name}</option>)}</select></label><label>Storlek (m²)<input type="number" min={10} max={400} value={calcArea} onChange={e => setCalcArea(Number(e.target.value))} /></label></div>
        <div className="calc-result">
          <div className="calc-result-row"><span>Uppskattad tid</span><b>{hoursDisplay.toFixed(1)} h</b></div>
          <div className="calc-result-row"><span>Uppskattat pris</span><b>{Math.round(priceDisplay)} kr</b></div>
          {estimate?.rutEligible && <div className="calc-result-row calc-result-rut"><span>Efter RUT-avdrag</span><b>{Math.round(afterRutDisplay)} kr</b></div>}
        </div>
        <a className="button light" href="#kontakt">Boka till detta pris <span>→</span></a>
        <small className="calc-disclaimer">Automatisk uppskattning baserad på {HOURLY_RATE} kr/timme och tjänstens genomsnittliga tidsåtgång. Ej bindande — priset bekräftas alltid av Maria M Städ innan bokning.</small>
      </div></div></section>
      <section className="rut reveal"><div><p className="eyebrow">RUT-AVDRAG &amp; ECO</p><h2>Lite lättare för plånboken.</h2></div><p>Som privatkund kan du använda RUT-avdrag för arbetskostnaden. Vill du städa extra miljövänligt? Fråga om vårt eco-paket med miljövänliga produkter.</p><a href="#kontakt" className="button light">Fråga oss om RUT <span>→</span></a></section>
      <section className="section areas"><div className="section-intro reveal"><p className="eyebrow">VART VI FINNS</p><h2>Vi städar i <em>hela Malmö.</em></h2><p>Oavsett var i staden du bor kommer vi gärna hem till dig.</p></div><div className="area-chips reveal">{areas.map(a => <span key={a}>{a}</span>)}</div></section>
      <section className="contact section" id="kontakt"><div className="contact-info reveal"><p className="eyebrow">KONTAKTA OSS</p><h2>Få en kostnadsfri <em>offert.</em></h2><p>Fyll i dina uppgifter så skickas din automatiska prisuppskattning direkt till Maria M Städ, som återkommer med en bekräftad offert.</p><div className="details"><a href="tel:0732770668">073-277 06 68</a><a href="mailto:Maria.m.stadning@gmail.com">Maria.m.stadning@gmail.com</a><span>Malmö · Öppet alla dagar 08:00–21:00</span></div><div className="contact-map reveal"><iframe src="https://maps.google.com/maps?q=Malm%C3%B6,Sverige&z=11&output=embed" title="Maria M Städs serviceområde i Malmö" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div></div><form className="reveal" onSubmit={submit}>{formStatus === 'sent' ? <div className="success" aria-live="polite"><b>Tack för din förfrågan!</b><p>Din prisuppskattning ({estimate?.price} kr) skickades till Maria M Städ tillsammans med dina kontaktuppgifter. Vi återkommer så snart vi kan.</p><button type="button" className="text-link" onClick={resetForm}>Skicka en ny förfrågan</button></div> : <>
        {estimate && <div className="form-estimate" aria-live="polite"><span>Din uppskattning: {calcService}, {calcArea} m²</span><b>{estimate.price} kr{estimate.rutEligible && ` · ${estimate.afterRut} kr efter RUT`}</b></div>}
        <div className="form-grid">
          <label>Namn<input required placeholder="Ditt namn" value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Telefon<input required type="tel" placeholder="Ditt telefonnummer" value={phone} onChange={e => setPhone(e.target.value)} /></label>
          <label>E-post<input required type="email" placeholder="Din e-postadress" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Typ av städning<select required value={calcService} onChange={e => setCalcService(e.target.value)}>{services.map(([x]) => <option key={x} value={x}>{x}</option>)}</select></label>
          <label>Postnummer<input placeholder="Ex. 211 20" value={postcode} onChange={e => setPostcode(e.target.value)} /></label>
          <label>Bostadens storlek / m²<input type="number" min={10} max={400} placeholder="Ex. 75" value={calcArea} onChange={e => setCalcArea(Number(e.target.value))} /></label>
        </div>
        <label>Meddelande<textarea placeholder="Berätta gärna mer om vad du behöver hjälp med." rows={4} value={message} onChange={e => setMessage(e.target.value)}></textarea></label>
        {formStatus === 'error' && <p className="form-error" role="alert">Något gick fel och förfrågan kunde inte skickas automatiskt. <a href={mailtoFallback}>Klicka här för att skicka den via e-post istället</a>.</p>}
        <button className="button" type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? 'Skickar…' : <>Begär kostnadsfri offert <span>→</span></>}</button>
      </>}</form></section>
    </main>
    <footer className="footer"><div><img src="/images/logo.png" alt="Maria M Städ" width={80} height={97} loading="lazy" /><p>Personlig och professionell städning i Malmö sedan 2019.</p></div><div><b>Snabblänkar</b><a href="#tjanster">Tjänster</a><a href="#om-oss">Om oss</a><a href="#kalkylator">Prisberäkning</a><a href="#kontakt">Kontakt</a></div><div><b>Kontakt</b><a href="tel:0732770668">073-277 06 68</a><a href="mailto:Maria.m.stadning@gmail.com">Maria.m.stadning@gmail.com</a></div><small>© 2026 Maria M Städ</small></footer>
    <a href="#kontakt" className={floatingVisible ? 'floating-cta visible' : 'floating-cta'} aria-hidden={!floatingVisible}>Få offert <span>→</span></a>
  </>
}
export default App
