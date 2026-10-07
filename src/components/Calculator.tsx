import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TARIFFS, MAX_LINK } from "../data";

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function Calculator() {
  const [area, setArea] = useState(25);
  const [tariffId, setTariffId] = useState(TARIFFS[0].id);
  const [rateOptionId, setRateOptionId] = useState("standard");
  const tariff = TARIFFS.find((t) => t.id === tariffId)!;
  const rateOption = tariff.rateOptions?.find((option) => option.id === rateOptionId);
  const rate = tariff.rate ?? rateOption?.rate ?? null;
  const price = rate ? Math.max(rate * area, tariff.minPrice) : null;

  return (
    <section id="calc" className="bg-graphite py-20 text-white md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <div>
          <div className="kicker">Калькулятор</div>
          <h2 className="mt-3 text-3xl font-semibold leading-snug md:text-4xl">
            Узнайте цену сейчас.
            <br />
            <span className="text-white/50">Без звонков и «менеджер свяжется».</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
            Это финальная цена, а не приманка. Фиксируем её до приезда команды —
            на месте она не вырастет.
          </p>
        </div>

        <div className="rounded-3xl bg-white/[0.06] p-7 backdrop-blur md:p-9">
          <div className="flex flex-wrap gap-2">
            {TARIFFS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTariffId(t.id)}
                aria-pressed={t.id === tariffId}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  t.id === tariffId ? "bg-emerald text-white" : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {tariff.rateOptions && (
            <div className="mt-6">
              <div className="mb-2 text-sm text-white/60">Тип остекления</div>
              <div className="flex flex-wrap gap-2">
                {tariff.rateOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setRateOptionId(option.id)}
                    aria-pressed={option.id === rateOptionId}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      option.id === rateOptionId
                        ? "border-emerald bg-emerald/15 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="block font-semibold">{option.name}</span>
                    <span className="mt-0.5 block text-xs text-white/50">{fmt(option.rate)} ₽/м²</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <label htmlFor="area" className="text-sm text-white/60">
                Площадь помещения
              </label>
              <span className="text-xl font-bold">{area} м²</span>
            </div>
            <input
              id="area"
              type="range"
              min={25}
              max={250}
              step={5}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="mt-3 w-full accent-emerald"
            />
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            {price ? (
              <>
                <div className="text-sm text-white/55">Стоимость · {tariff.duration}</div>
                <div className="mt-1 text-4xl font-bold text-white">{fmt(price)} ₽</div>
                <div className="mt-2 text-xs text-white/40">
                  {fmt(rate!)} ₽/м²
                  {tariff.minPrice ? ` · минимальный заказ ${fmt(tariff.minPrice)} ₽` : ""}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-white/55">Под ключ считаем индивидуально</div>
                <div className="mt-1 text-2xl font-bold text-white">Точная смета за 15 минут</div>
              </>
            )}
            <a
              href={MAX_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-6 w-full justify-center"
            >
              Забронировать слот <ArrowRight size={16} />
            </a>
            <p className="mt-4 text-center text-[11px] text-white/40">
              Бронь в MAX за 2 минуты. Оплата — после приёмки работы.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
