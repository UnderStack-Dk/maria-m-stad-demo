// Tjänster, priskalkyl och texter som delas mellan startsidan och /tjanster, /om.
export const services: [string, string][] = [
  ['Hemstädning', 'Ett rent och trivsamt hem, vecka efter vecka.'],
  ['Flyttstädning', 'Grundlig genomgång inför eller efter en flytt.'],
  ['Storstädning', 'En grundlig rengöring när hemmet behöver lite extra.'],
  ['Kontorsstädning', 'Fräscha lokaler för kontor och arbetsplatser.'],
  ['Fönsterputs', 'Rena och klara fönster utan krångel.'],
  ['Företagsstädning', 'Flexibla lösningar för företag och verksamheter.'],
  ['Hotellstädning', 'Dagligt fräscht i hotellrum och gemensamma utrymmen.'],
  ['Studentstädning', 'Snabbt och billigt för studentrum och korridorer.'],
]

// Priset räknas som tid × timpris, inte ett fast pris per m² — tiden beror
// på hur många m² en städare hinner med per timme för respektive tjänst.
export const HOURLY_RATE = 349 // kr/timme, före RUT-avdrag
const MIN_HOURS_DEFAULT = 2
export const jobProfile: Record<string, { m2PerHour: number; minHours: number; rut: boolean }> = {
  'Hemstädning': { m2PerHour: 25, minHours: MIN_HOURS_DEFAULT, rut: true },
  'Flyttstädning': { m2PerHour: 15, minHours: 4, rut: true },
  'Storstädning': { m2PerHour: 18, minHours: 3, rut: true },
  'Kontorsstädning': { m2PerHour: 30, minHours: MIN_HOURS_DEFAULT, rut: false },
  'Fönsterputs': { m2PerHour: 40, minHours: 1, rut: true },
  'Företagsstädning': { m2PerHour: 28, minHours: MIN_HOURS_DEFAULT, rut: false },
  'Hotellstädning': { m2PerHour: 22, minHours: MIN_HOURS_DEFAULT, rut: false },
  'Studentstädning': { m2PerHour: 20, minHours: 1, rut: true },
}

export type Estimate = { hours: number; price: number; afterRut: number; rutEligible: boolean }

export function estimateQuote(service: string, area: number): Estimate | null {
  const profile = jobProfile[service]
  if (!profile) return null
  const safeArea = Math.max(0, area || 0)
  // Ingen avrundning till halvtimmar — priset ska ändras vid varje ändring av ytan.
  const rawHours = safeArea / profile.m2PerHour
  const hours = Math.max(profile.minHours, rawHours)
  const price = Math.round((hours * HOURLY_RATE) / 10) * 10
  const afterRut = profile.rut ? Math.round((price * 0.5) / 10) * 10 : price
  return { hours, price, afterRut, rutEligible: profile.rut }
}

export const reviews: [string, string][] = [
  ['Julia Gustafsson', 'Mycket trevlig, pålitlig och effektiv personal. Flexibel bokning och planering.'],
  ['Felicia Airosto', 'Strålande service och städning. Bäddar t.o.m. våran hunds säng och uteplats och är jätteduktig med våra glasdörrar o badrummet. Väldigt uppskattat.'],
]

export const areas = ['Centrum', 'Västra Hamnen', 'Limhamn', 'Hyllie', 'Rosengård', 'Oxie', 'Bunkeflostrand']

export const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
export const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined
// Uppdatera till kundens egna domän när sajten går live där.
export const SITE_URL = 'https://maria-m-stad-demo.vercel.app'

export const COMPANY_EMAIL = 'Maria.m.stadning@gmail.com'
export const COMPANY_PHONE = '0732770668'
export const COMPANY_PHONE_DISPLAY = '073-277 06 68'

// Checklista per tjänst, baserad på mariamstad.se/services.
export type ServiceChecklist = { room: string; items: string[] }
export const serviceDetails: Record<string, ServiceChecklist[]> = {
  'Hemstädning': [
    { room: 'Husrum', items: ['Dammsugning av golv, mattor och golvlister', 'Putsning av speglar', 'Moppning av golv', 'Tömning av papperskorgar', 'Damning av lampor'] },
    { room: 'Badrum', items: ['Samma punkter som husrum, samt:', 'Rengöring av badkar och duschutrymme', 'Rengöring av handfat', 'Rengöring av toalett', 'Borttagning av fläckar på badrumsmöbler', 'Avtorkning av hängare och handdukstork'] },
    { room: 'Kök', items: ['Samma punkter som husrum, samt:', 'Rengöring av spisen utvändigt', 'Rengöring av micro', 'Rengöring av diskho och diskbänk', 'Rengöring av kakel', 'Avtorkning av hushållsmaskiner, kyl/frys, bord och stolar'] },
  ],
  'Flyttstädning': [
    { room: 'Husrum', items: ['Damma av väggar och tak', 'Dammsug och torka golv', 'Rengör garderober, även ovanpå', 'Rengör element, även bakom', 'Torka av dörrar, handtag och golvlister'] },
    { room: 'Badrum', items: ['Damma tak och rengör väggar', 'Rengör golv och golvbrunn', 'Rengör toalett, handfat och blandare', 'Rengör badkar, duschkabin och blandare', 'Rengör badrumsskåp'] },
    { room: 'Kök', items: ['Damma väggar och tak, dammsug och torka golv', 'Rengör diskho, blandare och element', 'Rengör köksfläkt, plåtar, spis och ugn', 'Rengör kyl/frys, även bakom, och diskmaskin', 'Torka ur alla skåp och lådor'] },
  ],
  'Storstädning': [
    { room: 'Husrum', items: ['Damning av vågräta ytor, även ovanpå skåp', 'Damning av tavelramar och lampor', 'Dammsugning av mattor, golv och golvlister', 'Avtorkning av luckor, element, kontakter, lister och dörrar', 'Putsning av speglar och moppning av golv'] },
    { room: 'Kök', items: ['Samma punkter som husrum, samt:', 'Rengöring av kakel över diskbänk', 'Rengöring av spisfläkt, filter och skyddsglas', 'Rengöring av micro, ugn och spis', 'Avtorkning av vitvaror, bord och stolar'] },
    { room: 'Badrum', items: ['Samma punkter som husrum, samt:', 'Avkalkning av golv, vägg och duschväggar', 'Rengöring av golvbrunnar och väggar', 'Rengöring av badkar, duschutrymme, handfat och toalett'] },
  ],
  'Hotellstädning': [
    { room: 'Rum', items: ['Plockning av disk och sopor', 'Samling av tvätt och smutsiga glas', 'Källsortering', 'Dammsugning och moppning av rum och korridor'] },
    { room: 'Badrum', items: ['Rengöring av toalett, kakel och duschvägg', 'Spolning och torkning av badkar', 'Putsning av kromdetaljer', 'Byte av tvål och toapapper', 'Nya handdukar och badrumsmatta'] },
  ],
  'Kontorsstädning': [
    { room: 'Kontorsyta', items: ['Tömning av papperskorgar och putsning av speglar', 'Torkning av tavlor, fönsterbrädor och fria ytor', 'Dammsugning av golv, mattor, soffor och fåtöljer', 'Avtorkning av skåp, hyllor, möbler och bord'] },
    { room: 'Kök & badrum', items: ['Samma punkter som hemstädning för kök och badrum'] },
  ],
  'Fönsterputs': [
    { room: 'Fönster', items: ['Putsning av samtliga fönster, 2-, 4- eller 6-sidigt glas', 'Avtorkning av karmar och foder', 'Avtorkning av fönsterbleck och fönsterbräda'] },
  ],
  'Företagsstädning': [
    { room: 'Verksamhetsyta', items: ['Flexibla scheman anpassade efter er verksamhet', 'Samma noggranna checklista som kontorsstädning', 'Möjlighet till kvälls- och helgstädning'] },
  ],
  'Studentstädning': [
    { room: 'Studentrum / korridor', items: ['Snabb och effektiv städning anpassad för studentbudget', 'Perfekt när tentaveckan inte lämnar tid över', 'Boka enstaka tillfällen eller löpande varje månad'] },
  ],
}
