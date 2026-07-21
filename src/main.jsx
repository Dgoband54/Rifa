import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronRight, ExternalLink, Gift, HeartPulse, Loader2, Medal, Music, Search, ShieldCheck, TicketCheck, Trophy } from 'lucide-react';
import { paymentConfig, prizes, storyGallery } from './siteConfig';
import './styles.css';

const TOTAL_BOLETOS = 1000;
const PRECIO_BOLETO = 2;
const FECHA_SORTEO = new Date('2026-08-02T18:00:00-05:00');
const GOOGLE_FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL;
const PROGRESS_API_URL = import.meta.env.VITE_PROGRESS_API_URL;

function useCountdown(targetDate) {
  const [remaining, setRemaining] = React.useState(() => Math.max(0, targetDate - new Date()));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, targetDate - new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const totalSeconds = Math.floor(remaining / 1000);

  return {
    dias: Math.floor(totalSeconds / 86400),
    horas: Math.floor((totalSeconds % 86400) / 3600),
    minutos: Math.floor((totalSeconds % 3600) / 60),
    segundos: totalSeconds % 60
  };
}

function ProgressCountdown({ vendidos }) {
  const countdown = useCountdown(FECHA_SORTEO);
  const porcentaje = Math.min(100, (vendidos / TOTAL_BOLETOS) * 100);
  const metaAlcanzada = vendidos >= TOTAL_BOLETOS;

  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="panel-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Meta solidaria</p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Boletos vendidos</h2>
          </div>
          <span className="rounded-md border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 font-gaming text-sm font-bold text-cyan-100">
            {vendidos}/{TOTAL_BOLETOS}
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-sm bg-white/10">
          <div
            className="h-full rounded-sm bg-gradient-to-r from-red-500 via-orange-400 to-cyan-300 transition-all duration-700"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-300">
          {metaAlcanzada ? 'Meta alcanzada. Gracias por hacerlo posible.' : `${TOTAL_BOLETOS - vendidos} boletos disponibles.`}
        </p>
      </div>

      <div className="panel-card p-4 shadow-glow sm:p-5">
        <p className="eyebrow text-cyan-200">Evento en vivo</p>
        <h2 className="mt-1 font-gaming text-xl font-black text-white sm:text-2xl">Cuenta regresiva</h2>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(countdown).map(([label, value]) => (
            <div key={label} className="rounded-md border border-cyan-300/30 bg-cyan-300/10 p-2 text-center sm:p-3">
              <div className="font-gaming text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(125,211,252,0.9)] sm:text-3xl">
                {String(value).padStart(2, '0')}
              </div>
              <div className="mt-1 text-xs font-bold uppercase text-sky-200">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-300">Sábado 2 de agosto de 2026, 18:00 hrs.</p>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090f]/88 px-4 backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 sm:h-16">
        <a href="#" className="font-gaming text-lg font-black text-white">
          DIEGO<span className="text-yellow-200">RIFA</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-black uppercase text-slate-300 md:flex">
          <a className="transition hover:text-yellow-200" href="#historia">Historia</a>
          <a className="transition hover:text-yellow-200" href="#premios">Premios</a>
          <a className="transition hover:text-yellow-200" href="#comprar">Comprar</a>
        </nav>
        <a href="#comprar" className="rounded-md bg-yellow-300 px-4 py-2 text-sm font-black uppercase text-slate-950 transition hover:bg-yellow-200">
          Participar
        </a>
      </div>
    </header>
  );
}

function TrustStats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-6">
      <div className="stats-band">
        <div>
          <p className="font-gaming text-3xl font-black text-yellow-200 sm:text-4xl">$2</p>
          <p className="mt-2 text-sm font-bold uppercase text-slate-300">Valor del boleto</p>
        </div>
        <div>
          <p className="font-gaming text-3xl font-black text-cyan-200 sm:text-4xl">6</p>
          <p className="mt-2 text-sm font-bold uppercase text-slate-300">Premios activos</p>
        </div>
        <div>
          <p className="font-gaming text-3xl font-black text-red-300 sm:text-4xl">1000</p>
          <p className="mt-2 text-sm font-bold uppercase text-slate-300">Tickets maximos</p>
        </div>
        <div>
          <p className="font-gaming text-3xl font-black text-violet-200 sm:text-4xl">1</p>
          <p className="mt-2 text-sm font-bold uppercase text-slate-300">Objetivo solidario</p>
        </div>
      </div>
    </section>
  );
}

function GoogleFormPurchaseCard({ vendidos }) {
  const metaAlcanzada = vendidos >= TOTAL_BOLETOS;
  const formEnabled = GOOGLE_FORM_URL && !GOOGLE_FORM_URL.includes('YOUR_FORM_ID');

  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-3">
        <ExternalLink className="h-6 w-6 text-red-300" />
        <h2 className="text-2xl font-black text-white">Participa ahora</h2>
      </div>

      <p className="mt-4 text-slate-300">
        El registro y el comprobante se reciben en Google Forms. Tus numeros quedan pendientes hasta revisar el pago.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-xs font-bold uppercase text-cyan-200">Valor</p>
          <p className="text-3xl font-black text-white">${PRECIO_BOLETO}</p>
        </div>
        <div className="rounded-md border border-red-300/20 bg-red-400/10 p-4">
          <p className="text-xs font-bold uppercase text-red-200">Estado</p>
          <p className="text-xl font-black text-white">Pendiente</p>
        </div>
      </div>

      {!formEnabled && (
        <div className="mt-5 rounded-lg bg-amber-100 p-4 font-bold text-amber-800">
          Configura VITE_GOOGLE_FORM_URL en tu archivo .env para activar el formulario.
        </div>
      )}

      <a
        href={!metaAlcanzada && formEnabled ? GOOGLE_FORM_URL : undefined}
        target="_blank"
        rel="noreferrer"
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-black text-white shadow-orangeGlow sm:py-4 sm:text-lg ${
          metaAlcanzada || !formEnabled ? 'pointer-events-none bg-slate-600' : 'bg-red-500 hover:bg-red-400'
        }`}
      >
        {metaAlcanzada ? 'Meta alcanzada' : 'Abrir formulario de compra'}
        {!metaAlcanzada && formEnabled && <ExternalLink size={20} />}
      </a>
    </div>
  );
}

function TicketLookupCard() {
  const [whatsapp, setWhatsapp] = React.useState('');
  const [lookupState, setLookupState] = React.useState({
    status: 'idle',
    compras: [],
    message: ''
  });
  const lookupEnabled = PROGRESS_API_URL && !PROGRESS_API_URL.includes('YOUR_SCRIPT_DEPLOYMENT_ID');

  const handleLookup = async (event) => {
    event.preventDefault();
    const phone = whatsapp.trim();

    if (!phone) {
      setLookupState({
        status: 'error',
        compras: [],
        message: 'Ingresa el WhatsApp que pusiste en el formulario.'
      });
      return;
    }

    if (!lookupEnabled) {
      setLookupState({
        status: 'error',
        compras: [],
        message: 'La consulta se activa cuando configuras VITE_PROGRESS_API_URL.'
      });
      return;
    }

    setLookupState({ status: 'loading', compras: [], message: '' });

    try {
      const url = new URL(PROGRESS_API_URL);
      url.searchParams.set('whatsapp', phone);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('No se pudo consultar.');
      const data = await response.json();
      if (!Object.prototype.hasOwnProperty.call(data, 'compras')) {
        throw new Error('Endpoint sin consulta de boletos.');
      }
      const compras = Array.isArray(data.compras) ? data.compras : [];

      setLookupState({
        status: 'success',
        compras,
        message: compras.length ? '' : 'Todavia no aparecen boletos para ese WhatsApp.'
      });
    } catch (error) {
      setLookupState({
        status: 'error',
        compras: [],
        message: error.message === 'Endpoint sin consulta de boletos.'
          ? 'Falta actualizar el Apps Script publicado para activar esta consulta.'
          : 'No se pudo consultar ahora. Intenta otra vez en un momento.'
      });
    }
  };

  return (
    <div className="panel-card p-6 lg:col-span-2">
      <div className="flex items-center gap-3">
        <TicketCheck className="h-6 w-6 text-cyan-200" />
        <h2 className="text-2xl font-black text-white">Consulta tus boletos</h2>
      </div>

      <form onSubmit={handleLookup} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="ticket-whatsapp">WhatsApp usado en el formulario</label>
        <input
          id="ticket-whatsapp"
          className="input"
          inputMode="tel"
          type="tel"
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
          placeholder="WhatsApp usado en el formulario"
        />
        <button
          type="submit"
          disabled={lookupState.status === 'loading'}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 font-black uppercase text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
        >
          {lookupState.status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          Consultar
        </button>
      </form>

      {lookupState.message && (
        <p className={`mt-4 text-sm font-bold ${lookupState.status === 'error' ? 'text-red-200' : 'text-slate-300'}`}>
          {lookupState.message}
        </p>
      )}

      {lookupState.compras.length > 0 && (
        <div className="mt-5 grid gap-3">
          {lookupState.compras.map((compra, index) => (
            <div key={`${compra.estado}-${index}`} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-black text-white">Compra #{index + 1}</p>
                <span className="rounded-sm bg-yellow-300 px-3 py-1 text-xs font-black uppercase text-slate-950">
                  {compra.estado || 'pendiente'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {compra.numeros_boletos.map((ticket) => (
                  <span key={ticket} className="rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 font-gaming text-sm font-black text-cyan-100">
                    #{ticket}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryGallery() {
  return (
    <div className="panel-card p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-3">
        {storyGallery.map((item) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-md bg-slate-900 text-left"
          >
            <div className="aspect-square overflow-hidden">
              <img
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                src={item.imageUrl}
                alt={item.title}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-gaming text-xs font-black text-white sm:text-sm">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-300 sm:text-xs">{item.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [vendidos, setVendidos] = React.useState(0);

  React.useEffect(() => {
    if (!PROGRESS_API_URL || PROGRESS_API_URL.includes('YOUR_SCRIPT_DEPLOYMENT_ID')) return;

    fetch(PROGRESS_API_URL)
      .then((response) => response.json())
      .then((data) => setVendidos(data.boletosActivos || 0))
      .catch(() => setVendidos(0));
  }, []);

  return (
    <main className="min-h-screen bg-[#07090f] text-slate-100">
      <Header />
      <section className="hero-grid relative overflow-hidden px-4 py-8 sm:px-5 sm:py-12 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-yellow-300/40 bg-yellow-300/10 px-4 py-2 text-sm font-black uppercase text-yellow-100">
              <HeartPulse size={18} /> Rifa solidaria medica
            </p>
            <h1 className="mt-4 max-w-4xl font-gaming text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Ayudame en mi operacion
            </h1>
            <p className="mt-3 max-w-3xl text-xl font-black leading-tight text-cyan-100 sm:text-2xl lg:text-3xl">
              Rifa benefica para financiar la cirugia de mi meñique.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Cada boleto es un apoyo directo para mi cirugia y recuperacion. Tu ayuda me acerca a recuperar movilidad y retomar mis actividades con normalidad sin tener ni sentir dolor ♡.
            </p>
            <a href="#comprar" className="mt-5 inline-flex items-center gap-2 rounded-md bg-red-500 px-5 py-3 text-base font-black text-white shadow-xl transition hover:bg-red-400 sm:mt-7 sm:px-6 sm:py-4 sm:text-lg">
              Ayudame comprando un boleto
              <ChevronRight size={22} />
            </a>
          </div>
          <div className="fort-card overflow-hidden p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img className="h-full w-full object-cover" src={paymentConfig.heroImageUrl} alt="Evidencia visual de la operacion" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/30 to-transparent" />
              <div className="absolute right-4 top-4 rounded-md bg-yellow-300 px-3 py-2 font-gaming text-sm font-black text-slate-950">ACTIVA</div>
              <div className="absolute bottom-5 left-5 right-5">
                <Gift className="h-10 w-10 text-red-300" />
                <p className="mt-3 font-gaming text-2xl font-black text-white">Valor del boleto: $2</p>
                <p className="mt-1 text-sm font-semibold text-slate-300">Cada boleto ayuda a cubrir la cirugia y recuperacion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProgressCountdown vendidos={vendidos} />
      <TrustStats />

      <section id="historia" className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3 text-yellow-200">
            <Music />
            <span className="font-black uppercase">Historia</span>
          </div>
          <h2 className="mt-3 font-gaming text-2xl font-black text-white sm:text-3xl">Un meñique pequeño, una meta enorme</h2>
          <p className="mt-3 text-base leading-7 text-slate-300 sm:text-lg">
             ¡Hola! Soy Diego. Estoy organizando esta rifa para costear la cirugía de mi dedo meñique. Mi gran meta es recuperar la movilidad de mi mano al 100% para volver a tener una buena calidad de vida sin dolores. Cada boleto cuesta solo $2 y tu apoyo hace una diferencia inmensa en mi recuperación. ¡Ayúdame a llegar a la meta!  
          </p>
        </div>
        <StoryGallery />
      </section>

      <section id="premios" className="px-4 py-8 sm:px-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-yellow-200">
            <Trophy />
            <span className="font-black uppercase">Premios</span>
          </div>
          <h2 className="mt-3 font-gaming text-2xl font-black text-white sm:text-3xl">6 premios para agradecer tu apoyo</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Cada boleto participa en el sorteo y suma directamente a la meta.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {prizes.map((premio, index) => (
              <article key={premio.name} className="prize-card">
                <div className="relative aspect-[1.2/1] overflow-hidden">
                  <img className="h-full w-full object-cover transition duration-500 hover:scale-105" src={premio.imageUrl} alt={premio.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-transparent to-transparent" />
                  <span className="absolute left-2 top-2 rounded-sm bg-yellow-300 px-2 py-1 font-gaming text-[10px] font-black text-slate-950 sm:left-4 sm:top-4 sm:px-3 sm:text-xs">PREMIO #{index + 1}</span>
                </div>
                <div className="p-3 sm:p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-200">{premio.tag}</p>
                  <h3 className="mt-1 min-h-12 text-sm font-black leading-tight text-white sm:mt-2 sm:min-h-14 sm:text-xl">{premio.name}</h3>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-300 sm:mt-4 sm:text-sm">
                    <Medal size={18} className="text-yellow-200" /> Sorteo solidario
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comprar" className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-5 lg:grid-cols-[0.85fr_1fr]">
        <div className="panel-card overflow-hidden p-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img className="h-full w-full object-cover" src={paymentConfig.imageUrl} alt="Imagen editable para cuenta bancaria" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/20 to-transparent" />
          </div>
          <div className="p-6">
          <p className="text-sm font-black uppercase text-red-300">Pago</p>
          <h2 className="mt-2 text-3xl font-black">Valor del boleto: $2</h2>
          <p className="mt-5 text-lg font-bold">Cuenta bancaria: {paymentConfig.accountNumber}</p>
          <p className="text-slate-300">{paymentConfig.accountName} - {paymentConfig.bankName}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">
            <ShieldCheck size={18} /> Comprobante por Google Forms
          </div>
          </div>
        </div>
        <GoogleFormPurchaseCard vendidos={vendidos} />
        <TicketLookupCard />
      </section>

      <footer className="border-t border-white/10 px-4 py-6 sm:px-5 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-gaming text-xl font-black text-white">DIEGORIFA</p>
            <p className="mt-2 text-sm font-semibold text-slate-400">Diego Banda - Rifa Benefica para mi Cirugia</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-300">
            <a href="#historia" className="hover:text-yellow-200">Historia</a>
            <a href="#premios" className="hover:text-yellow-200">Premios</a>
            <a href="#comprar" className="hover:text-yellow-200">Participar</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
