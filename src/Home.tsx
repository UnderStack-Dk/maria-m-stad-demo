import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import emailjs from '@emailjs/browser'
import { Link } from 'react-router-dom'
import { useCountUp, useScrollReveal } from './hooks'
import { BeforeAfterSlider, AiBadge, Seo } from './components'
import {
  services, reviews, areas, estimateQuote, HOURLY_RATE, jobProfile,
  EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY,
  COMPANY_EMAIL, COMPANY_PHONE, COMPANY_PHONE_DISPLAY,
} from './data'

function Home() {
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

  useScrollReveal([])

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
  const calcProfile = jobProfile[calcService]
  const calcDisclaimer = calcProfile
    ? `Automatisk uppskattning för ${calcService.toLowerCase()} baserad på ${HOURLY_RATE} kr/timme och ca ${calcProfile.m2PerHour} m² per timme (minst ${calcProfile.minHours} h per uppdrag)${calcProfile.rut ? ', RUT-avdraget är redan avdraget ovan' : ''}. Ej bindande — priset bekräftas alltid av Maria M Städ innan bokning.`
    : `Automatisk uppskattning baserad på ${HOURLY_RATE} kr/timme och tjänstens genomsnittliga tidsåtgång. Ej bindande — priset bekräftas alltid av Maria M Städ innan bokning.`

  const scoreDisplay = useCountUp(scoreVisible ? 5 : 0, 1000)
  const priceDisplay = useCountUp(estimate?.price ?? 0, 350)
  const afterRutDisplay = useCountUp(estimate?.afterRut ?? 0, 350)
  const hoursDisplay = useCountUp(estimate?.hours ?? 0, 350)

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
      estimated_hours: estimate.hours.toFixed(1),
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
    `Namn: ${name}\nTelefon: ${phone}\nE-post: ${email}\nTjänst: ${calcService}\nYta: ${calcArea} m²\nPostnummer: ${postcode || '–'}\nMeddelande: ${message || '–'}\n\nUppskattad tid: ${estimate.hours.toFixed(1)} h\nUppskattat pris: ${estimate.price} kr${estimate.rutEligible ? ` (${estimate.afterRut} kr efter RUT-avdrag)` : ''}`
  )}` : `mailto:${COMPANY_EMAIL}`

  return <main>
    <Seo title="Maria M Städ | Professionell städning i Malmö" description="Hemstädning, flyttstädning, storstädning och företagsstädning i Malmö sedan 2019. RUT-avdrag, personlig service, kostnadsfri offert." path="/" />
    <section className="hero" id="hem"><div className="hero-copy"><p className="eyebrow">STÄDFIRMA I MALMÖ</p><h1>Städning i Malmö, <em>gjord ordentligt.</em></h1><p className="lead">Hemstädning, flyttstädning och företagsstädning sedan 2019.</p><div className="actions"><a className="button" href="#kontakt">Få en kostnadsfri offert <span>→</span></a><a className="text-link" href="#tjanster">Se våra tjänster</a></div><div className="hero-trust"><span>5.0 i kundomdömen</span><span>RUT-avdrag</span><span>Sedan 2019</span></div></div><div className="hero-image"><img src="/images/hero.jpg" alt="Professionell städning i hemmet" width={1200} height={1460} fetchPriority="high" /><div className="image-note"><b>Personlig service</b><small>När det passar dig</small></div></div></section>
    <section className="trust"><span>Svarar samma dag</span><span>•</span><span>Öppet alla dagar 08–21</span><span>•</span><span>Enkelt att boka</span></section>
    <section className="section services" id="tjanster"><div className="section-intro reveal"><p className="eyebrow">VÅRA TJÄNSTER</p><h2>Våra tjänster <em>i Malmö.</em></h2><p>Oavsett om du behöver hjälp hemma, vid flytt eller på jobbet hittar vi en lösning som passar.</p><Link to="/tjanster" className="text-link">Se allt som ingår i varje tjänst <span>→</span></Link></div><div className="service-list">{services.map(([name, description], i) => <a href="#kalkylator" className="service reveal" style={{ transitionDelay: `${i * 70}ms` }} key={name}><span className="service-number">0{i + 1}</span><div><h3>{name}</h3><p>{description}</p></div><span className="arrow">↗</span></a>)}</div></section>
    <section className="about section" id="om-oss"><div className="about-image reveal"><img src="/images/about.jpg" alt="Städning med fokus på detaljer" width={900} height={850} loading="lazy" /></div><div className="about-copy reveal"><p className="eyebrow">OM MARIA M STÄD</p><h2>Så jobbar vi.</h2><p>Maria M Städ har städat hem, kontor och studentrum i Malmö sedan 2019. Vill du veta mer om oss och hur vi jobbar?</p><div className="benefits"><div><b>Noggranna</b><span>Vi ser de små sakerna.</span></div><div><b>Personliga</b><span>En kontakt du kan lita på.</span></div><div><b>Flexibla</b><span>Tider och upplägg som passar.</span></div><div><b>Pålitliga</b><span>Trygg hjälp, varje gång.</span></div></div><Link to="/om" className="text-link">Läs mer om oss <span>→</span></Link></div></section>
    <section className="before-after section"><div className="section-intro reveal"><p className="eyebrow">RESULTATET TALAR</p><h2>Före och <em>efter.</em></h2><p>Dra i reglaget och se skillnaden efter en noggrann städning.</p></div><div className="reveal"><BeforeAfterSlider before="/images/before.jpg" after="/images/after.jpg" /></div></section>
    <section className="reviews section" id="omdomen"><div className="section-intro reveal"><p className="eyebrow">VAD VÅRA KUNDER SÄGER</p><h2>Omsorg som <em>märks.</em></h2></div><div className="review-summary reveal" ref={scoreRef}><b>{scoreDisplay.toFixed(1)}</b><span>i kundomdömen<br/><small>Vi är stolta över varje återkommande kund.</small></span></div><div className="quotes">{reviews.map(([name, quote], i) => <blockquote className="reveal" style={{ transitionDelay: `${i * 90}ms` }} key={name}>“{quote}”<footer>{name}</footer></blockquote>)}</div></section>
    <section className="video-cta reveal" id="kalkylator"><video src="/videos/hero-bg.mp4" autoPlay muted loop playsInline preload="none" poster="/images/hero.jpg" aria-hidden="true" /><div className="video-cta-content"><AiBadge>Smart prisuppskattning</AiBadge><h2>Beräkna ditt pris <em>direkt.</em></h2><p>Välj tjänst och yta så räknar vi ut en verklig uppskattning utifrån arbetstid och timpris — inget påhittat pris per kvadratmeter.</p><div className="calculator">
      <div className="calc-row"><label>Typ av städning<select value={calcService} onChange={e => setCalcService(e.target.value)}>{services.map(([name]) => <option key={name} value={name}>{name}</option>)}</select></label><label>Storlek (m²)<input type="number" min={10} max={400} value={calcArea} onChange={e => setCalcArea(Number(e.target.value))} /></label></div>
      <div className="calc-result">
        <div className="calc-result-row"><span>Uppskattad tid</span><b>{hoursDisplay.toFixed(1)} h</b></div>
        <div className="calc-result-row"><span>Uppskattat pris</span><b>{Math.round(priceDisplay)} kr</b></div>
        {estimate?.rutEligible && <div className="calc-result-row calc-result-rut"><span>Efter RUT-avdrag</span><b>{Math.round(afterRutDisplay)} kr</b></div>}
      </div>
      <a className="button light" href="#kontakt">Boka till detta pris <span>→</span></a>
      <small className="calc-disclaimer">{calcDisclaimer}</small>
    </div></div></section>
    <section className="rut reveal"><div><p className="eyebrow">RUT-AVDRAG &amp; ECO</p><h2>Lite lättare för plånboken.</h2></div><p>Som privatkund kan du använda RUT-avdrag för arbetskostnaden. Vill du städa extra miljövänligt? Fråga om vårt eco-paket med miljövänliga produkter.</p><a href="#kontakt" className="button light">Fråga oss om RUT <span>→</span></a></section>
    <section className="section areas"><div className="section-intro reveal"><p className="eyebrow">VART VI FINNS</p><h2>Vi städar i <em>hela Malmö.</em></h2><p>Oavsett var i staden du bor kommer vi gärna hem till dig.</p></div><div className="area-chips reveal">{areas.map(a => <span key={a}>{a}</span>)}</div></section>
    <section className="contact section" id="kontakt"><div className="contact-info reveal"><p className="eyebrow">KONTAKTA OSS</p><h2>Få en kostnadsfri <em>offert.</em></h2><p>Fyll i dina uppgifter så skickas din automatiska prisuppskattning direkt till Maria M Städ, som återkommer med en bekräftad offert.</p><div className="details"><a href={`tel:${COMPANY_PHONE}`}>{COMPANY_PHONE_DISPLAY}</a><a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a><span>Malmö · Öppet alla dagar 08:00–21:00</span></div><div className="contact-map reveal"><iframe src="https://maps.google.com/maps?q=Malm%C3%B6,Sverige&z=11&output=embed" title="Maria M Städs serviceområde i Malmö" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div></div><form className="reveal" onSubmit={submit}>{formStatus === 'sent' ? <div className="success" aria-live="polite"><b>Tack för din förfrågan!</b><p>Din prisuppskattning ({estimate?.price} kr) skickades till Maria M Städ tillsammans med dina kontaktuppgifter. Vi återkommer så snart vi kan.</p><button type="button" className="text-link" onClick={resetForm}>Skicka en ny förfrågan</button></div> : <>
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
}
export default Home
