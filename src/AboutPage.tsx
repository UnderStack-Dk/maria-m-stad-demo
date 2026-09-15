import { Link } from 'react-router-dom'
import { useScrollReveal } from './hooks'
import { COMPANY_PHONE_DISPLAY } from './data'

function AboutPage() {
  useScrollReveal([])
  return <main>
    <section className="page-hero reveal">
      <p className="eyebrow">OM MARIA M STÄD</p>
      <h1>Städning med <em>tydlig kommunikation.</em></h1>
      <p className="lead">Sedan vi öppnade 2019 har vi haft en enkel inställning: städning av högsta kvalité, och en tydlig och klar kommunikation med varje kund — hela vägen.</p>
    </section>
    <section className="section about-story">
      <div className="about-story-copy reveal">
        <h2>Billigt, snabbt och <em>effektivt.</em></h2>
        <p>Till skillnad från många andra städfirmor i Malmö lovar vi inte mer än vi kan hålla. Vi erbjuder billig, snabb och effektiv städning vid fönsterputsning, flyttstädning och hem-/företagsstädning — utan att tumma på noggrannheten.</p>
        <p>Vårt team har städat hem, kontor och studentrum i Malmö sedan 2019, och de flesta av våra kunder kommer tillbaka gång på gång. Vi tror det beror på att vi faktiskt lyssnar: vi kommer i tid, frågar vad som är viktigast för dig, och lämnar det riktigt rent efter oss.</p>
        <blockquote>”Kontakta oss på {COMPANY_PHONE_DISPLAY} om ni vill ha den bästa städhjälpen i landet.”<footer>Vi som jobbar på Maria M</footer></blockquote>
      </div>
      <div className="about-story-values reveal">
        <div><b>Sedan 2019</b><span>Fem år av nöjda kunder i Malmö.</span></div>
        <div><b>Tydlig kommunikation</b><span>Du vet alltid vad som ingår och vad det kostar.</span></div>
        <div><b>RUT-avdrag</b><span>Vi hjälper dig med avdraget, steg för steg.</span></div>
        <div><b>Flexibla tider</b><span>Öppet alla dagar 08:00–21:00.</span></div>
      </div>
    </section>
    <section className="cta-band reveal">
      <h2>Vill du bli vår <em>nästa nöjda kund?</em></h2>
      <p>Ring oss på {COMPANY_PHONE_DISPLAY} eller begär en kostnadsfri offert direkt.</p>
      <Link to="/#kontakt" className="button">Få en kostnadsfri offert <span>→</span></Link>
    </section>
  </main>
}
export default AboutPage
