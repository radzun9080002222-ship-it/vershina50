import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import Messengers from "./Messengers";

export default function Hero() {
  const [area, setArea] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    fetch('https://apuajxotemukpjheppaz.supabase.co/functions/v1/cleaning-stats', { signal: controller.signal, cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(data => {
        const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
        const currentMonth = `${month.find(p => p.type === 'year')?.value}-${month.find(p => p.type === 'month')?.value}`;
        const age = Date.now() - Date.parse(data.updatedAt);
        if (!controller.signal.aborted && data.month === currentMonth && data.scope === 'all-cities' && typeof data.area === 'number' && Number.isFinite(data.area) && data.area >= 0 && age >= -60000 && age <= 36 * 3600000) setArea(data.area);
      })
      .catch(() => { /* Keep a truthful checklist badge when the statistics are unavailable. */ })
      .finally(() => window.clearTimeout(timer));
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, []);
  return (
    <section id="top" className="relative overflow-hidden bg-white pt-[72px]">
      <div className="container-x grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-emerald/40" />
            <span className="text-base font-bold uppercase tracking-widest2 text-emerald">Вершина</span>
            <span className="h-px w-8 bg-emerald/40" />
          </div>
          <h1 className="text-[17vw] font-bold leading-[0.95] tracking-tight text-graphite md:text-[120px]">
            Чисто<span className="text-emerald">.</span>
          </h1>
          <span
            className="mt-1 block leading-[0.8] text-emerald text-[13vw] md:text-[66px]"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            в Балашихе
          </span>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70 md:text-xl">
            Доступный клининг в каждую квартиру и дом Балашихи.
            Точная цена за 2 минуты — до приезда, а не после.
          </p>
          <div className="mt-9">
            <a href="#calc" className="btn-primary">
              Узнать свою цену <ArrowDown size={16} />
            </a>
          </div>
          <Messengers className="mt-5" />
          <dl className="mt-12 flex gap-10 border-t border-black/5 pt-7">
            <div>
              <dt className="text-2xl font-bold text-graphite">47</dt>
              <dd className="mt-1 text-xs text-ink/55">пунктов чек-листа приёмки</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-graphite">48 ч</dt>
              <dd className="mt-1 text-xs text-ink/55">гарантии после уборки</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-graphite">0 ₽</dt>
              <dd className="mt-1 text-xs text-ink/55">доплат на месте</dd>
            </div>
          </dl>
        </div>
        <div className="relative">
          <img src="/images/hero-balashikha.webp" alt="Светлая квартира с видом на Преображенский собор в Балашихе" className="aspect-[4/5] w-full rounded-3xl object-cover" fetchPriority="high" />
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-5 shadow-card md:block">
            <div className="text-[11px] font-semibold uppercase tracking-widest2 text-emerald">{area === null ? 'приёмка по стандарту' : 'убрано в этом месяце'}</div>
            <div className="mt-1 text-2xl font-bold text-graphite">
              {area === null ? '47 пунктов' : `${area.toLocaleString('ru-RU')} м²`}
            </div>
            {area !== null && <div className="mt-1 text-xs text-ink/55">по всем городам «Вершины»</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
