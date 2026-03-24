"use client";

const ANIMALS = [
  { name: "Хулгана", icon: "🐀" }, { name: "Үхэр", icon: "🐂" },
  { name: "Бар", icon: "🐅" }, { name: "Туулай", icon: "🐇" },
  { name: "Луу", icon: "🐉" }, { name: "Могой", icon: "🐍" },
  { name: "Морь", icon: "🐎" }, { name: "Хонь", icon: "🐑" },
  { name: "Бич", icon: "🐒" }, { name: "Тахиа", icon: "🐓" },
  { name: "Нохой", icon: "🐕" }, { name: "Гахай", icon: "🐖" },
];

const ELEMENTS = [
  { name: "Мод", color: "text-green-300" },
  { name: "Гал", color: "text-red-300" },
  { name: "Газар", color: "text-yellow-300" },
  { name: "Төмөр", color: "text-gray-300" },
  { name: "Ус", color: "text-blue-300" },
];

const FAVORABLE = [
  "Аялал", "Худалдаа", "Гэр бүл", "Сурлага",
  "Эрүүл мэнд", "Шинэ ажил", "Гэрээ", "Уулзалт",
];
const UNFAVORABLE = [
  "Зээл авах", "Маргаан", "Нүүдэл", "Том худалдан авалт",
];

const MESSAGES = [
  "Тайван байхыг хичээ. Сэтгэлийн хүч чухал.",
  "Шинэ боломж нээгдэнэ. Зоригтой алхам хий.",
  "Ойр дотнохонтой цагаа өнгөрүүл.",
  "Суралцахад тохиромжтой өдөр.",
  "Хэмнэлт чухал. Санхүүгээ анхаар.",
  "Эрүүл мэндэд анхаар. Амар.",
  "Удирдах чадвараа харуул.",
  "Бүтээлч ажилд сайн өдөр.",
];

function getDailyZurkhai() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const seed = today.getFullYear();
  const animalIdx = (seed + dayOfYear) % 12;
  const elementIdx = (seed + dayOfYear * 3) % 5;
  const lunarDay = (dayOfYear % 30) + 1;
  const favStart = (dayOfYear * 7) % FAVORABLE.length;
  const unfavStart = (dayOfYear * 5) % UNFAVORABLE.length;
  return {
    animal: ANIMALS[animalIdx],
    element: ELEMENTS[elementIdx],
    lunarDay,
    message: MESSAGES[(dayOfYear + seed) % MESSAGES.length],
    favorable: [FAVORABLE[favStart], FAVORABLE[(favStart + 1) % FAVORABLE.length]],
    unfavorable: [UNFAVORABLE[unfavStart]],
  };
}

export default function ZurkhaiWidget() {
  const z = getDailyZurkhai();

  return (
    <div className="bg-gradient-to-br from-amber-700 to-red-900 rounded-lg p-3 text-white shadow">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-bold text-xs">☯ Монгол зурхай</h3>
        <span className="text-[10px] text-amber-200">Билгийн {z.lunarDay}</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-2xl">{z.animal.icon}</span>
        <div>
          <p className="text-sm font-bold leading-tight">
            {z.animal.name} · <span className={z.element.color}>{z.element.name}</span>
          </p>
          <p className="text-[10px] text-amber-100 mt-0.5">{z.message}</p>
        </div>
      </div>
      <div className="flex gap-2 text-[10px]">
        <div className="flex-1 bg-white/10 rounded px-2 py-1">
          <span className="text-green-300 font-semibold">✓ </span>
          {z.favorable.join(", ")}
        </div>
        <div className="flex-1 bg-white/10 rounded px-2 py-1">
          <span className="text-red-300 font-semibold">✗ </span>
          {z.unfavorable.join(", ")}
        </div>
      </div>
    </div>
  );
}
