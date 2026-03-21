import Link from "next/link";
import Header from "../components/Header";
import CategoryBar from "../components/CategoryBar";
import SearchBar from "../components/SearchBar";
import ArticleCard from "../components/ArticleCard";
import AdBanner from "../components/AdBanner";
import StockTicker from "../components/StockTicker";
import WeatherWidget from "../components/WeatherWidget";
import ZurkhaiWidget from "../components/ZurkhaiWidget";
import GallerySection from "../components/GallerySection";
import { getArticles } from "../lib/api";

const CATEGORIES = [
  { key: "world", label: "Дэлхий", icon: "🌍" },
  { key: "politics", label: "Улс төр", icon: "🏛️" },
  { key: "business", label: "Бизнес", icon: "📊" },
  { key: "tech", label: "Технологи", icon: "💻" },
  { key: "science", label: "Шинжлэх ухаан", icon: "🔬" },
  { key: "sports", label: "Спорт", icon: "⚽" },
  { key: "health", label: "Эрүүл мэнд", icon: "🏥" },
  { key: "entertainment", label: "Соёл урлаг", icon: "🎬" },
];

function groupArticles(articles) {
  const grouped = {};
  CATEGORIES.forEach((c) => (grouped[c.key] = { regular: [], videos: [] }));
  articles.forEach((a) => {
    const cat = a.category || "world";
    const bucket = grouped[cat] || grouped["world"];
    if (a.is_video === 1) bucket.videos.push(a);
    else bucket.regular.push(a);
  });
  return grouped;
}

const CATEGORY_GRADIENTS = {
  world: "from-blue-600 to-indigo-800",
  politics: "from-slate-600 to-gray-800",
  business: "from-emerald-600 to-teal-800",
  tech: "from-violet-600 to-purple-800",
  science: "from-cyan-600 to-blue-800",
  sports: "from-green-600 to-emerald-800",
  health: "from-rose-500 to-pink-800",
  entertainment: "from-amber-500 to-orange-800",
};
const CATEGORY_ICONS = {
  world: "🌍", politics: "🏛️", business: "📊", tech: "💻",
  science: "🔬", sports: "⚽", health: "🏥", entertainment: "🎬",
};

// Жижиг мэдээний мөр (зураг + гарчиг хажуу хажуугаар)
function SmallArticle({ article }) {
  const gradient = CATEGORY_GRADIENTS[article.category] || "from-gray-600 to-gray-800";
  const icon = CATEGORY_ICONS[article.category] || "📰";

  return (
    <Link href={`/article/${article.id}`}>
      <div className="flex gap-3 bg-white rounded-lg border hover:shadow-md transition-shadow p-2.5 cursor-pointer">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-24 h-[68px] object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className={`w-24 h-[68px] bg-gradient-to-br ${gradient} rounded flex-shrink-0 flex items-center justify-center`}>
            <span className="text-2xl opacity-80">{icon}</span>
          </div>
        )}
        <div className="min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-blue-600">{article.source}</span>
              {article.is_video === 1 && (
                <span className="text-[10px] text-red-500 font-bold">▶</span>
              )}
              {article.published_at && (
                <span className="text-[10px] text-gray-400">
                  {new Date(article.published_at).toLocaleDateString("mn-MN")}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Видео карт (дахин ашиглах)
function VideoCard({ article }) {
  return (
    <Link href={`/article/${article.id}`}>
      <div className="relative rounded-lg overflow-hidden bg-gray-900 h-36 group cursor-pointer">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${CATEGORY_GRADIENTS[article.category] || "from-red-800 to-gray-900"} flex items-center justify-center`}>
            <span className="text-3xl opacity-60">📹</span>
          </div>
        )}
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors">
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className="text-[9px] text-red-300">{article.source}</span>
          <h4 className="text-xs font-bold text-white line-clamp-2">{article.title}</h4>
        </div>
      </div>
    </Link>
  );
}

// Нэг ангиллын хэсэг (компакт загвар)
function CategorySection({ category, regular, videos, isAI, allVideos }) {
  if (regular.length === 0 && videos.length === 0) return null;

  // Видео мөрийг 3 болгож дүүргэх: эхлээд тухайн ангиллын, дутуу бол бусдаас нэмэх
  const needed = 3 - videos.length;
  let mixedVideos = [...videos.slice(0, 3)];
  if (needed > 0 && allVideos) {
    const usedIds = new Set(mixedVideos.map((v) => v.id));
    const extras = allVideos
      .filter((v) => !usedIds.has(v.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, needed);
    mixedVideos = [...mixedVideos, ...extras];
  }

  let aiArticle = null;
  let otherArticles = regular;
  if (isAI) {
    const aiIdx = regular.findIndex(
      (a) =>
        a.title?.toLowerCase().includes("ai") ||
        a.title?.toLowerCase().includes("artificial") ||
        a.title?.includes("хиймэл оюун") ||
        a.ai_summary?.toLowerCase().includes("artificial intelligence") ||
        a.ai_summary?.includes("хиймэл оюун")
    );
    if (aiIdx !== -1) {
      aiArticle = regular[aiIdx];
      otherArticles = [...regular.slice(0, aiIdx), ...regular.slice(aiIdx + 1)];
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-5 border-t-2 border-blue-700">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900">
          {category.icon} {category.label}
        </h2>
        <Link
          href={`/?category=${category.key}`}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Бүгдийг харах →
        </Link>
      </div>

      {/* AI онцлох мэдээ */}
      {aiArticle && (
        <Link href={`/article/${aiArticle.id}`}>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-lg p-3 text-white mb-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded">🤖 AI</span>
              <span className="text-[10px] text-violet-200">{aiArticle.source}</span>
            </div>
            <h3 className="text-sm font-bold line-clamp-2">{aiArticle.title}</h3>
          </div>
        </Link>
      )}

      {/* Мэдээний жагсаалт */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {otherArticles.slice(0, 6).map((article) => (
          <SmallArticle key={article.id} article={article} />
        ))}
      </div>

      {/* Видео мэдээ — 1 картын зайд 3 жижиг видео */}
      {mixedVideos.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 mb-1.5">
            <span className="text-red-500">▶</span> Видео
          </p>
          <div className="flex gap-1.5 h-20">
            {mixedVideos.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/article/${article.id}`} className="flex-1 min-w-0">
                <div className="relative rounded overflow-hidden bg-gray-900 h-full group cursor-pointer">
                  {article.image_url ? (
                    <img src={article.image_url} alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${CATEGORY_GRADIENTS[article.category] || "from-red-800 to-gray-900"}`} />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-red-600/90 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-1 pb-0.5">
                    <p className="text-[8px] text-white font-medium line-clamp-1 drop-shadow">{article.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "";

  let articles = [];
  try {
    articles = await getArticles({ search, category, limit: 100 });
  } catch {}

  // Хайлт/шүүлт горим
  if (search || category) {
    const catInfo = CATEGORIES.find((c) => c.key === category);
    return (
      <>
        <Header />
        <StockTicker />
        <CategoryBar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center mb-6"><SearchBar /></div>
          {search && (
            <p className="text-gray-500 text-sm mb-4">
              &ldquo;{search}&rdquo; — {articles.length} мэдээ олдлоо
            </p>
          )}
          {catInfo && <h2 className="text-2xl font-black mb-4">{catInfo.icon} {catInfo.label}</h2>}
          {articles.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl mb-2">Мэдээ олдсонгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </main>
        <AdBanner position="footer" />
      </>
    );
  }

  // Нүүр хуудас
  const grouped = groupArticles(articles);
  const heroArticles = articles.filter((a) => a.is_video !== 1).slice(0, 5);
  const heroIds = new Set(heroArticles.map((a) => a.id));
  Object.values(grouped).forEach((g) => {
    g.regular = g.regular.filter((a) => !heroIds.has(a.id));
    g.videos = g.videos.filter((a) => !heroIds.has(a.id));
  });
  const allVideos = articles.filter((a) => a.is_video === 1);

  return (
    <>
      <Header />
      <StockTicker />
      <CategoryBar />

      <div className="relative bg-gray-50">
        {/* Search */}
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex justify-center"><SearchBar /></div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-2">Мэдээ олдсонгүй</p>
            <p className="text-sm">Backend серверийг ажиллуулж мэдээ татна уу.</p>
          </div>
        ) : (
          <>
            {/* ===== HERO: Толгойн мэдээ ===== */}
            <section className="max-w-6xl mx-auto px-4 pt-4 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Гол мэдээ */}
                {heroArticles[0] && (
                  <div className="md:col-span-2">
                    <Link href={`/article/${heroArticles[0].id}`}>
                      <div className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
                        {heroArticles[0].image_url ? (
                          <img
                            src={heroArticles[0].image_url}
                            alt={heroArticles[0].title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className={`w-full h-48 bg-gradient-to-br ${CATEGORY_GRADIENTS[heroArticles[0].category] || "from-blue-600 to-indigo-800"} flex items-center justify-center`}>
                            <span className="text-5xl opacity-70">{CATEGORY_ICONS[heroArticles[0].category] || "📰"}</span>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">ШИНЭ</span>
                            <span className="text-[10px] text-blue-600 font-medium">{heroArticles[0].source}</span>
                            {heroArticles[0].published_at && (
                              <span className="text-[10px] text-gray-400">
                                {new Date(heroArticles[0].published_at).toLocaleDateString("mn-MN")}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-black text-gray-900 leading-snug line-clamp-2">
                            {heroArticles[0].title}
                          </h2>
                          {heroArticles[0].ai_summary && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {heroArticles[0].ai_summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Хажуугийн мэдээнүүд */}
                <div className="flex flex-col gap-2.5">
                  {heroArticles.slice(1, 5).map((article) => (
                    <SmallArticle key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </section>

            {/* Зар */}
            <div className="max-w-6xl mx-auto px-4 py-2">
              <AdBanner position="header" />
            </div>

            {/* ===== Цаг агаар + Зурхай ===== */}
            <section className="max-w-6xl mx-auto px-4 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <WeatherWidget />
                <ZurkhaiWidget />
              </div>
            </section>

            {/* ===== Ангилал бүрээр ===== */}
            {CATEGORIES.map((cat, i) => (
              <div key={cat.key}>
                <CategorySection
                  category={cat}
                  regular={grouped[cat.key].regular}
                  videos={grouped[cat.key].videos}
                  isAI={cat.key === "tech"}
                  allVideos={allVideos}
                />
                {i % 3 === 2 && i < CATEGORIES.length - 1 && (
                  <div className="max-w-6xl mx-auto px-4 py-2">
                    <AdBanner position="between_articles" />
                  </div>
                )}
              </div>
            ))}

            {/* ===== Галерей ===== */}
            <GallerySection />

            {/* ===== Бүх видео мэдээ ===== */}
            {allVideos.length > 0 && (
              <section className="bg-gray-900 py-8">
                <div className="max-w-6xl mx-auto px-4">
                  <h2 className="text-xl font-black text-white mb-4">
                    <span className="text-red-500">▶</span> Бүх видео мэдээ
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allVideos.slice(0, 8).map((article) => (
                      <VideoCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        <div className="max-w-6xl mx-auto px-4 py-3">
          <AdBanner position="footer" />
        </div>
      </div>
    </>
  );
}
