import { Link } from 'react-router-dom'
import { useScrollReveal } from './hooks'
import { services, serviceDetails } from './data'

function ServicesPage() {
  useScrollReveal([])
  return <main>
    <section className="page-hero reveal">
      <p className="eyebrow">VÅRA TJÄNSTER</p>
      <h1>Allt som ingår, <em>svart på vitt.</em></h1>
      <p className="lead">Ingen gissningslek om vad som städas. Här är den fullständiga checklistan för varje tjänst vi erbjuder i Malmö.</p>
      <Link to="/#kalkylator" className="button">Beräkna ditt pris <span>→</span></Link>
    </section>
    <section className="section services-detail">
      {services.map(([name, description]) => {
        const rooms = serviceDetails[name]
        return <details className="service-card reveal" key={name}>
          <summary>
            <div><h2>{name}</h2><p>{description}</p></div>
            <span className="service-card-toggle" aria-hidden="true">+</span>
          </summary>
          {rooms && <div className="service-card-body">
            {rooms.map(({ room, items }) => <div className="service-room" key={room}>
              <h3>{room}</h3>
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>)}
          </div>}
        </details>
      })}
    </section>
    <section className="cta-band reveal">
      <h2>Redo för en <em>uppskattning?</em></h2>
      <p>Använd vår smarta priskalkylator på startsidan — ingen bindning, inget krångel.</p>
      <Link to="/#kalkylator" className="button">Till priskalkylatorn <span>→</span></Link>
    </section>
  </main>
}
export default ServicesPage
