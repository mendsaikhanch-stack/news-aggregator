import Link from "next/link";

export const metadata = {
  title: "MEDEE.MN - Demo | AI-Powered News Aggregator",
  description:
    "Дэлхийн мэдээг монгол хэлээр нэг дороос. AI орчуулга, 18+ эх сурвалж.",
};

const features = [
  {
    icon: "🌍",
    title: "18+ Эх сурвалж",
    desc: "BBC, NY Times, Al Jazeera, Guardian, iKon.mn, GoGo.mn зэрэг дэлхийн болон Монголын тэргүүлэх мэдээллийн хэрэгсэл",
  },
  {
    icon: "🤖",
    title: "AI Орчуулга",
    desc: "Google Translate, MyMemory, Claude AI fallback chain ашиглан бүх мэдээг автоматаар монгол хэл рүү орчуулна",
  },
  {
    icon: "⏰",
    title: "Автомат шинэчлэл",
    desc: "30 минут тутамд шинэ мэдээг автоматаар татаж, орчуулж, ангилна",
  },
  {
    icon: "📂",
    title: "9 Ангилал",
    desc: "Дэлхий, Технологи, Бизнес, Спорт, Шинжлэх ухаан, Эрүүл мэнд, Улс төр, Соёл урлаг - AI keyword ангилал",
  },
  {
    icon: "🎬",
    title: "YouTube TV",
    desc: "Eagle News, MNB, TV9 Mongolia зэрэг ТВ сувгуудын бичлэг",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Зочдын тоо, хандалт, төхөөрөмж, хамгийн их уншсан мэдээ - бүгдийг хянана",
  },
  {
    icon: "📰",
    title: "Бүтэн мэдээ орчуулга",
    desc: "Мэдээний бүтэн агуулгыг татаж монголоор орчуулж, апп дотроо уншуулна",
  },
  {
    icon: "📢",
    title: "Зар сурталчилгаа",
    desc: "Header, footer, мэдээний дунд - 4 бүсэд зар байршуулах боломж",
  },
];

const techStack = [
  { name: "Next.js 15", role: "Frontend" },
  { name: "React 19", role: "UI" },
  { name: "Tailwind CSS", role: "Styling" },
  { name: "FastAPI", role: "Backend" },
  { name: "SQLAlchemy", role: "ORM" },
  { name: "SQLite", role: "Database" },
  { name: "APScheduler", role: "Auto-fetch" },
  { name: "Claude AI", role: "Translation" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-gray-900 text-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-800 text-2xl font-black">
            N
          </div>
          <h1 className="text-5xl font-black tracking-tight">MEDEE.MN</h1>
        </div>
        <p className="text-xl text-blue-200 mb-2">
          Дэлхийн мэдээ — Нэг дороос, Монголоор
        </p>
        <p className="text-blue-300 mb-8">
          AI-Powered Bilingual News Aggregator
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-white text-blue-800 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors text-lg"
          >
            Сайт руу очих →
          </Link>
          <a
            href="#features"
            className="border-2 border-white/30 px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors text-lg"
          >
            Дэлгэрэнгүй
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "18+", label: "Эх сурвалж" },
            { num: "4", label: "Бүс нутаг" },
            { num: "9", label: "Ангилал" },
            { num: "24/7", label: "Автомат" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur rounded-xl p-4 text-center"
            >
              <div className="text-3xl font-black text-white">{stat.num}</div>
              <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">
          Боломжууд
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/15 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">
          Хэрхэн ажилладаг
        </h2>
        <div className="space-y-6">
          {[
            {
              step: "1",
              title: "Мэдээ цуглуулах",
              desc: "RSS feeds болон web scraping-аар 18+ эх сурвалжаас мэдээ татна",
            },
            {
              step: "2",
              title: "AI Орчуулга",
              desc: "Google Translate → MyMemory → Claude AI fallback chain ашиглан монголоор орчуулна",
            },
            {
              step: "3",
              title: "Ангилал & Хадгалалт",
              desc: "Keyword-д суурилан автоматаар 9 ангилалд хуваана",
            },
            {
              step: "4",
              title: "Хэрэглэгчид харуулах",
              desc: "Цэвэрхэн, хурдан интерфейсээр монгол хэл дээр мэдээг уншуулна",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-lg">{s.title}</h3>
                <p className="text-blue-200">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">
          Технологийн стек
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((t) => (
            <div
              key={t.name}
              className="bg-white/10 backdrop-blur rounded-lg p-4 text-center"
            >
              <div className="font-bold">{t.name}</div>
              <div className="text-blue-300 text-xs mt-1">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* News Sources */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">
          Мэдээний эх сурвалжууд
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: "NY Times", region: "Америк" },
            { name: "BBC News", region: "Европ" },
            { name: "The Guardian", region: "Европ" },
            { name: "Al Jazeera", region: "Ази" },
            { name: "CNA", region: "Ази" },
            { name: "SCMP", region: "Ази" },
            { name: "France 24", region: "Европ" },
            { name: "DW", region: "Европ" },
            { name: "Euronews", region: "Европ" },
            { name: "Yonhap", region: "Ази" },
            { name: "TASS", region: "Европ" },
            { name: "iKon.mn", region: "Монгол" },
            { name: "GoGo.mn", region: "Монгол" },
            { name: "News.mn", region: "Монгол" },
            { name: "Eagle News", region: "Монгол" },
            { name: "MNB", region: "Монгол" },
            { name: "TV9", region: "Монгол" },
            { name: "Times of India", region: "Ази" },
          ].map((s) => (
            <div
              key={s.name}
              className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-blue-300">{s.region}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Одоо эхлээрэй</h2>
        <p className="text-blue-200 mb-8">
          Дэлхийн мэдээг монгол хэлээр, нэг дороос
        </p>
        <Link
          href="/"
          className="bg-white text-blue-800 px-10 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors text-xl inline-block"
        >
          MEDEE.MN руу очих →
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-6 text-center text-blue-300 text-sm">
        MEDEE.MN — AI-Powered News Aggregator
      </div>
    </div>
  );
}
