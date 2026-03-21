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
  "Аялал жуулчлал", "Худалдаа наймаа", "Гэр бүлийн үйлс", "Сурлага боловсрол",
  "Эрүүл мэндийн үзлэг", "Шинэ ажил эхлэх", "Гэрээ хэлцэл", "Найз нөхөдтэй уулзах",
  "Мал маллах", "Бизнес төлөвлөгөө", "Спорт дасгал", "Буяны үйлс",
];

const UNFAVORABLE = [
  "Зээл авах", "Маргаан тэмцэл", "Нүүдэл хийх", "Том худалдан авалт",
  "Шүүхийн хэрэг", "Хол замын аялал", "Сөрөг хүмүүстэй уулзах",
];

const MESSAGES = [
  "Өнөөдөр тайван, тогтвортой байхыг хичээвэл бүх зүйл урагшлана. Сэтгэлийн хүч чухал.",
  "Шинэ боломж нээгдэх өдөр. Зоригтой алхам хийхэд зүгээр үе.",
  "Гэр бүл, ойр дотны хүмүүстэйгээ цаг зав гарга. Дулаан харилцаа адис авчрана.",
  "Оюун ухааны хүч дээд цэгтээ. Суралцах, шинэ зүйл мэдэж авахад тохиромжтой.",
  "Эд хөрөнгийн хэрэгт анхааралтай хандах хэрэгтэй. Хэмнэлт чухал.",
  "Эрүүл мэндэд анхаар. Амрал авах, биеэ сэргээхэд цаг гарга.",
  "Хамт олны дунд нэр хүнд нэмэгдэнэ. Удирдах чадвараа харуул.",
  "Урлаг, бүтээлч ажилд амжилттай өдөр. Сэтгэл хөдлөл уран бүтээл болно.",
];

function getDailyZurkhai() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  const yearSeed = today.getFullYear();

  const animalIdx = (yearSeed + dayOfYear) % 12;
  const elementIdx = (yearSeed + dayOfYear * 3) % 5;
  const lunarDay = (dayOfYear % 30) + 1;
  const lunarMonth = Math.floor(dayOfYear / 30) + 1;

  const msgIdx = (dayOfYear + yearSeed) % MESSAGES.length;

  // Pick favorable/unfavorable based on day
  const favCount = 2 + (dayOfYear % 3);
  const unfavCount = 1 + (dayOfYear % 2);
  const favStart = (dayOfYear * 7) % FAVORABLE.length;
  const unfavStart = (dayOfYear * 5) % UNFAVORABLE.length;

  const fav = [];
  for (let i = 0; i < favCount; i++) {
    fav.push(FAVORABLE[(favStart + i) % FAVORABLE.length]);
  }
  const unfav = [];
  for (let i = 0; i < unfavCount; i++) {
    unfav.push(UNFAVORABLE[(unfavStart + i) % UNFAVORABLE.length]);
  }

  return {
    animal: ANIMALS[animalIdx],
    element: ELEMENTS[elementIdx],
    lunarDay,
    lunarMonth,
    message: MESSAGES[msgIdx],
    favorable: fav,
    unfavorable: unfav,
  };
}

export default function ZurkhaiWidget() {
  const z = getDailyZurkhai();

  return (
    <div className="bg-gradient-to-br from-amber-700 via-orange-800 to-red-900 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Монгол зурхай</h3>
        <span className="text-xs text-amber-200">
          Билгийн {z.lunarMonth} сарын {z.lunarDay}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{z.animal.icon}</span>
        <div>
          <p className="font-bold text-lg leading-tight">{z.animal.name} · <span className={z.element.color}>{z.element.name}</span></p>
          <p className="text-xs text-amber-200 mt-0.5">Өнөөдрийн эзэн</p>
        </div>
      </div>

      <p className="text-sm text-amber-100 mb-3 leading-relaxed">{z.message}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/10 rounded-lg p-2">
          <p className="text-green-300 font-semibold mb-1">Тохиромжтой</p>
          {z.favorable.map((f, i) => (
            <p key={i} className="text-amber-100">· {f}</p>
          ))}
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <p className="text-red-300 font-semibold mb-1">Болгоомжтой</p>
          {z.unfavorable.map((u, i) => (
            <p key={i} className="text-amber-100">· {u}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
