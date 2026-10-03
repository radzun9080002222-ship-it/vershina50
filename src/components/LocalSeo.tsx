import { TARIFFS } from "../data";

export default function LocalSeo() {
  return (
    <section className="bg-white py-16">
      <div className="container-x max-w-5xl">
        <h2 className="text-2xl font-semibold text-graphite md:text-3xl">Клининг квартир и домов в Балашихе</h2>
        <p className="mt-5 text-sm leading-7 text-ink/65">«Вершина» помогает поддерживать чистоту, подготовить квартиру к переезду и убрать строительную пыль после ремонта. Работаем в Балашихе, Железнодорожном, Кучино, Саввино, Павлино и других микрорайонах города. Возможность выезда и время приезда согласуем при заказе.</p>
        <h3 className="mt-7 text-lg font-semibold">Сколько стоит уборка в Балашихе</h3>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-ink/65">
          {TARIFFS.map(t => <li key={t.id}>{t.name}: {t.rate ? `${t.rate} ₽/м²` : t.rateOptions?.map(o => `${o.name.toLowerCase()} — ${o.rate} ₽/м²`).join("; ")}. Минимальный заказ — {t.minPrice.toLocaleString("ru-RU")} ₽.</li>)}
        </ul>
        <p className="mt-4 text-sm leading-7 text-ink/65">Калькулятор считает от 25 м². Итоговая стоимость — ставка за метр, умноженная на площадь, но не ниже минимального заказа. Для уборки под ключ ставка зависит от типа окон. Состав работ и точную стоимость подтверждаем до приезда.</p>
      </div>
    </section>
  );
}
