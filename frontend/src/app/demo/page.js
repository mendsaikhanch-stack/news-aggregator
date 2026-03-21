import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/api/demo/stats`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return null;
  }
}

async function getSampleTranslation() {
  try {
    const res = await fetch(`${API_BASE}/api/demo/sample-translation`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return [];
  }
}

export const metadata = {
  title: "GEREGNEWS.MN - Investor Demo | AI-Powered News Aggregator",
  description:
    "Дэлхийн мэдээг монгол хэлээр нэг дороос. AI орчуулга, 18+ эх сурвалж.",
};

export default async function DemoPage() {
  const [stats, samples] = await Promise.all([
    getStats(),
    getSampleTranslation(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950 text-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/30">
            G
          </div>
          <div className="text-left">
            <h1 className="text-5xl font-black tracking-tight">GEREGNEWS</h1>
            <p className="text-blue-400 text-sm font-medium tracking-widest">
              AI-POWERED WORLD NEWS
            </p>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-blue-100 mb-3 max-w-2xl mx-auto leading-tight">
          Дэлхийн мэдээг монгол хэлээр,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            автоматаар, шууд
          </span>
        </h2>
        <p className="text-gray-400 mb-10 max-w-lg mx-auto">
          AI-powered bilingual news aggregator for the Mongolian market
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3.5 rounded-xl font-bold hover:from-blue-500 hover:to-blue-400 transition-all text-lg shadow-lg shadow-blue-500/25"
          >
            Live Demo үзэх →
          </Link>
          <a
            href="#problem"
            className="border border-white/20 px-8 py-3.5 rounded-xl font-medium hover:bg-white/5 transition-colors text-lg"
          >
            Дэлгэрэнгүй ↓
          </a>
        </div>
      </div>

      {/* Live Stats */}
      {stats && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-xs text-gray-500 mb-4 uppercase tracking-widest">
            Бодит цагийн мэдээлэл — Live Data
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                num: stats.total_articles || 0,
                label: "Нийт мэдээ",
                sub: "database-д",
              },
              {
                num: stats.translated_articles || 0,
                label: "Орчуулагдсан",
                sub: "EN → MN",
              },
              {
                num: (stats.total_sources || 0) + "+",
                label: "Эх сурвалж",
                sub: "дэлхийн",
              },
              { num: "24/7", label: "Автомат", sub: "30 мин тутам" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-center"
              >
                <div className="text-4xl font-black text-white mb-1">
                  {typeof stat.num === "number"
                    ? stat.num.toLocaleString()
                    : stat.num}
                </div>
                <div className="text-blue-300 text-sm font-medium">
                  {stat.label}
                </div>
                <div className="text-gray-500 text-xs mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem / Opportunity */}
      <div id="problem" className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <h3 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4">
              Асуудал
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="text-red-400 text-xl">1.</span>
                <span>
                  Монголд <strong className="text-white">3.4 сая</strong>{" "}
                  интернэт хэрэглэгч — гэхдээ дэлхийн мэдээг монголоор нэгтгэсэн
                  платформ <strong className="text-red-400">байхгүй</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 text-xl">2.</span>
                <span>
                  Монгол мэдээний сайтууд зөвхөн өөрийн контент — дэлхийн
                  мэдээг орчуулж өгдөг{" "}
                  <strong className="text-red-400">нэг ч үйлчилгээ алга</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 text-xl">3.</span>
                <span>
                  Залуу хэрэглэгчид англиар уншиж чаддаг ч{" "}
                  <strong className="text-white">
                    эх хэлээрээ мэдээ авахыг илүүд үздэг
                  </strong>
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
            <h3 className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">
              Шийдэл — GEREGNEWS.MN
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  18+ дэлхийн тэргүүлэх мэдээллийн сувгаас{" "}
                  <strong className="text-white">автоматаар</strong> мэдээ татна
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  AI орчуулгын fallback chain ашиглан{" "}
                  <strong className="text-white">
                    монгол хэл рүү шууд орчуулна
                  </strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span>
                  30 минут тутамд шинэчлэгдэж, ангилагдаж,{" "}
                  <strong className="text-white">
                    хэрэглэгчид хүргэгдэнэ
                  </strong>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Before / After Translation */}
      {samples && samples.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">
            AI Орчуулга — Бодит жишээ
          </h2>
          <p className="text-gray-400 text-center mb-10">
            Англи мэдээ автоматаар монгол хэл рүү орчуулагдаж байгаа бодит
            жишээ
          </p>
          <div className="space-y-6">
            {samples.slice(0, 2).map((s, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border-b border-white/10">
                  <span className="text-xs font-bold text-blue-400 uppercase">
                    {s.source}
                  </span>
                  <span className="text-gray-600">|</span>
                  <span className="text-xs text-gray-500">{s.category}</span>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded font-mono">
                        EN
                      </span>
                      <span className="text-gray-500 text-xs">Original</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {s.content_en
                        ? s.content_en.slice(0, 300) + "..."
                        : "Content not available"}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-mono">
                        MN
                      </span>
                      <span className="text-blue-400 text-xs">
                        AI Орчуулга
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">
                      {s.content_mn
                        ? s.content_mn.slice(0, 300) + "..."
                        : "Орчуулга байхгүй"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Хэрхэн ажилладаг
        </h2>
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent" />
          {[
            {
              step: "01",
              title: "Мэдээ цуглуулах",
              desc: "RSS feeds + web scraping-аар 18+ эх сурвалжаас 30 минут тутамд шинэ мэдээ татна",
              color: "blue",
            },
            {
              step: "02",
              title: "AI Орчуулга",
              desc: "Google Translate → MyMemory → Claude AI fallback chain ашиглан монголоор орчуулна",
              color: "purple",
            },
            {
              step: "03",
              title: "Ухаалаг ангилал",
              desc: "Keyword analysis ашиглан 9 ангилалд автоматаар хуваана (Дэлхий, Технологи, Бизнес...)",
              color: "cyan",
            },
            {
              step: "04",
              title: "Хэрэглэгчид хүргэх",
              desc: "Цэвэрхэн, хурдан PWA интерфейсээр утас, таблет, компьютерт зориулж хүргэнэ",
              color: "green",
            },
          ].map((s, i) => (
            <div
              key={s.step}
              className={`flex gap-6 items-start mb-10 ${i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""}`}
            >
              <div
                className={`w-14 h-14 bg-${s.color}-500/20 border border-${s.color}-500/30 rounded-2xl flex items-center justify-center text-${s.color}-400 text-lg font-black flex-shrink-0`}
              >
                {s.step}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Size */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Зах зээлийн боломж</h2>
        <p className="text-gray-400 text-center mb-10">
          Монголын дижитал мэдээллийн зах зээл
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black text-blue-400 mb-2">3.4М</div>
            <div className="text-sm text-gray-300 font-medium mb-1">
              Интернэт хэрэглэгч
            </div>
            <div className="text-xs text-gray-500">
              Монголын хүн амын 95%+
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black text-green-400 mb-2">$12М</div>
            <div className="text-sm text-gray-300 font-medium mb-1">
              Дижитал зарын зах зээл
            </div>
            <div className="text-xs text-gray-500">
              Жилд 25%+ өсөлттэй
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black text-purple-400 mb-2">0</div>
            <div className="text-sm text-gray-300 font-medium mb-1">
              Шууд өрсөлдөгч
            </div>
            <div className="text-xs text-gray-500">
              AI-тэй мэдээний агрегатор Монголд алга
            </div>
          </div>
        </div>
      </div>

      {/* Business Model */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Бизнес модель</h2>
        <p className="text-gray-400 text-center mb-10">
          Олон талт орлогын эх үүсвэр
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6">
            <div className="text-yellow-400 text-2xl mb-3">1</div>
            <h3 className="text-lg font-bold mb-2">Зар сурталчилгаа</h3>
            <p className="text-gray-400 text-sm mb-3">
              Header, footer, мэдээний дунд — 4 бүсэд зар байршуулна
            </p>
            <div className="text-yellow-400 text-xs font-bold uppercase">
              Аль хэдийн бэлэн
            </div>
          </div>
          <div className="bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
            <div className="text-blue-400 text-2xl mb-3">2</div>
            <h3 className="text-lg font-bold mb-2">Premium хандалт</h3>
            <p className="text-gray-400 text-sm mb-3">
              Бүтэн орчуулга, заргүй, push notification, bookmark
            </p>
            <div className="text-blue-400 text-xs font-bold uppercase">
              Дараагийн шат
            </div>
          </div>
          <div className="bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-6">
            <div className="text-green-400 text-2xl mb-3">3</div>
            <h3 className="text-lg font-bold mb-2">B2B API</h3>
            <p className="text-gray-400 text-sm mb-3">
              Банк, даатгал, корпорациудад мэдээний API-аар үйлчилнэ
            </p>
            <div className="text-green-400 text-xs font-bold uppercase">
              Ирээдүйн боломж
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Advantage */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Яагаад GEREGNEWS.MN?
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Боломж
                </th>
                <th className="py-3 px-4 text-center text-blue-400 font-bold">
                  GEREGNEWS.MN
                </th>
                <th className="py-3 px-4 text-center text-gray-500 font-medium">
                  iKon.mn
                </th>
                <th className="py-3 px-4 text-center text-gray-500 font-medium">
                  GoGo.mn
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Дэлхийн мэдээ", true, false, false],
                ["AI орчуулга", true, false, false],
                ["18+ эх сурвалж", true, false, false],
                ["Автомат шинэчлэл", true, true, true],
                ["Ангилал", true, true, true],
                ["Монгол мэдээ", true, true, true],
                ["YouTube ТВ", true, false, false],
                ["PWA апп", true, false, false],
                ["Analytics", true, "?", "?"],
              ].map(([feature, m, i, g]) => (
                <tr key={feature} className="border-b border-white/5">
                  <td className="py-3 px-4">{feature}</td>
                  <td className="py-3 px-4 text-center">
                    {m === true ? (
                      <span className="text-green-400 font-bold">✓</span>
                    ) : m === "?" ? (
                      <span className="text-gray-500">?</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {i === true ? (
                      <span className="text-green-400">✓</span>
                    ) : i === "?" ? (
                      <span className="text-gray-500">?</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {g === true ? (
                      <span className="text-green-400">✓</span>
                    ) : g === "?" ? (
                      <span className="text-gray-500">?</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Технологийн стек
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Next.js 15", role: "Frontend", color: "white" },
            { name: "React 19", role: "UI", color: "cyan" },
            { name: "Tailwind CSS", role: "Design", color: "blue" },
            { name: "FastAPI", role: "Backend", color: "green" },
            { name: "SQLAlchemy", role: "ORM", color: "red" },
            { name: "Claude AI", role: "Translation", color: "purple" },
            { name: "APScheduler", role: "Automation", color: "yellow" },
            { name: "PWA", role: "Mobile", color: "blue" },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
            >
              <div className="font-bold text-sm">{t.name}</div>
              <div className="text-gray-500 text-xs mt-1">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* News Sources */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Мэдээний эх сурвалжууд
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: "NY Times", region: "Америк", tier: "top" },
            { name: "BBC News", region: "Европ", tier: "top" },
            { name: "The Guardian", region: "Европ", tier: "top" },
            { name: "Al Jazeera", region: "Ази", tier: "top" },
            { name: "Japan Today", region: "Япон", tier: "new" },
            { name: "Japan Times", region: "Япон", tier: "new" },
            { name: "China Daily", region: "Хятад", tier: "new" },
            { name: "Global Times", region: "Хятад", tier: "new" },
            { name: "Korea Times", region: "Өмнөд Солонгос", tier: "new" },
            { name: "Yonhap", region: "Өмнөд Солонгос" },
            { name: "SCMP", region: "Хонг Конг" },
            { name: "CNA", region: "Сингапур" },
            { name: "Bangkok Post", region: "Тайланд", tier: "new" },
            { name: "Bangkok Post", region: "Тайланд", tier: "new" },
            { name: "Times of India", region: "Энэтхэг" },
            { name: "El Pais", region: "Испани", tier: "new" },
            { name: "DW", region: "Герман" },
            { name: "The Local ES", region: "Испани", tier: "new" },
            { name: "France 24", region: "Франц" },
            { name: "Euronews", region: "Европ" },
            { name: "Arab News", region: "Ойрхи Дорнод", tier: "new" },
            { name: "TASS", region: "Орос" },
            { name: "RTE", region: "Ирланд" },
            { name: "Turkish Minute", region: "Турк", tier: "new" },
            { name: "Arab News", region: "Саудын Араб", tier: "new" },
            { name: "Buenos Aires Times", region: "Аргентин", tier: "new" },
            { name: "iKon.mn", region: "Монгол", tier: "mn" },
            { name: "GoGo.mn", region: "Монгол", tier: "mn" },
            { name: "News.mn", region: "Монгол", tier: "mn" },
            { name: "Eagle News", region: "Монгол ТВ", tier: "tv" },
            { name: "MNB", region: "Монгол ТВ", tier: "tv" },
            { name: "TV9", region: "Монгол ТВ", tier: "tv" },
          ].map((s) => (
            <div
              key={s.name}
              className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                s.tier === "top"
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : s.tier === "new"
                    ? "bg-cyan-500/10 border border-cyan-500/20"
                    : s.tier === "mn"
                      ? "bg-green-500/10 border border-green-500/20"
                      : s.tier === "tv"
                        ? "bg-purple-500/10 border border-purple-500/20"
                        : "bg-white/5 border border-white/10"
              }`}
            >
              <span className="font-medium text-sm">{s.name}</span>
              <span className="text-xs text-gray-500">{s.region}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-black mb-4">
          Хамтран ажиллах боломж
        </h2>
        <p className="text-gray-400 mb-10 max-w-lg mx-auto">
          Монголын анхны AI-тэй мэдээний платформ. MVP бэлэн, хэрэглэгчид
          хүлээж байна.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold hover:from-blue-500 hover:to-blue-400 transition-all text-xl shadow-lg shadow-blue-500/25"
          >
            Live Demo үзэх →
          </Link>
          <Link
            href="/preview"
            className="border border-white/20 px-10 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors text-xl"
          >
            Утасны загвар
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8 text-center">
        <p className="text-gray-500 text-sm">
          GEREGNEWS.MN — AI-Powered Bilingual News Aggregator
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Built with Next.js, FastAPI, Claude AI
        </p>
      </div>
    </div>
  );
}
