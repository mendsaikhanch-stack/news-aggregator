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
import { getArticles, getVideos } from "../lib/api";

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
      <div className="flex gap-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow p-2.5 cursor-pointer">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-20 md:w-24 h-14 md:h-[68px] object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className={`w-20 md:w-24 h-14 md:h-[68px] bg-gradient-to-br ${gradient} rounded flex-shrink-0 flex items-center justify-center`}>
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
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
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
function CategorySection({ category, regular, isAI }) {
  if (regular.length === 0) return null;

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
    <section className="max-w-6xl mx-auto px-4 py-5 border-t-2 border-blue-700 dark:border-blue-500">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">
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

    </section>
  );
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "";
  const source = params?.source || "";
  const date_from = params?.date_from || "";
  const date_to = params?.date_to || "";

  let articles = [];
  let videoArticles = [];
  try {
    [articles, videoArticles] = await Promise.all([
      getArticles({ search, category, source, date_from, date_to, limit: 100 }),
      getVideos({ limit: 20 }),
    ]);
  } catch {}

  // Хайлт/шүүлт горим
  if (search || category || source || date_from || date_to) {
    const catInfo = CATEGORIES.find((c) => c.key === category);
    return (
      <>
        <Header />
        <StockTicker />
        <CategoryBar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center mb-6"><SearchBar /></div>
          {search && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              &ldquo;{search}&rdquo; — {articles.length} мэдээ олдлоо
            </p>
          )}
          {catInfo && <h2 className="text-2xl font-black dark:text-white mb-4">{catInfo.icon} {catInfo.label}</h2>}
          {articles.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
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
  const heroArticles = articles.filter((a) => a.is_video !== 1).slice(0, 6);
  const heroIds = new Set(heroArticles.map((a) => a.id));
  Object.values(grouped).forEach((g) => {
    g.regular = g.regular.filter((a) => !heroIds.has(a.id));
    g.videos = g.videos.filter((a) => !heroIds.has(a.id));
  });
  const allVideos = videoArticles.length > 0
    ? videoArticles
    : articles.filter((a) => a.is_video === 1);

  return (
    <>
      <Header />
      <StockTicker />
      <CategoryBar />

      <div className="relative bg-gray-50 dark:bg-gray-900">
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
                        <div className="relative w-full h-48 md:h-[340px] overflow-hidden">
                          {heroArticles[0].image_url ? (
                            <img
                              src={heroArticles[0].image_url}
                              alt={heroArticles[0].title}
                              className="block w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${CATEGORY_GRADIENTS[heroArticles[0].category] || "from-blue-600 to-indigo-800"} flex items-center justify-center`}>
                              <span className="text-5xl opacity-70">{CATEGORY_ICONS[heroArticles[0].category] || "📰"}</span>
                            </div>
                          )}
                        </div>
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
                <div className="flex flex-col gap-2">
                  {heroArticles.slice(1, 7).map((article) => (
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
                  isAI={cat.key === "tech"}
                />
                {i % 3 === 2 && i < CATEGORIES.length - 1 && (
                  <div className="max-w-6xl mx-auto px-4 py-2">
                    <AdBanner position="between_articles" />
                  </div>
                )}
              </div>
            ))}

            {/* ===== Бүх видео мэдээ (4 цонх, галерей хэмжээтэй) ===== */}
            {allVideos.length > 0 && (
              <section className="py-10 bg-gray-950">
                <div className="max-w-6xl mx-auto px-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-red-500 rounded-full" />
                    <div>
                      <h2 className="text-2xl font-black text-white"><span className="text-red-500">▶</span> Бүх видео мэдээ</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...allVideos].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)).slice(0, 4).map((article, i) => (
                      <Link key={`vp-${i}`} href={`/article/${article.id}`}>
                        <div className="relative rounded-xl overflow-hidden bg-gray-900 h-32 md:h-40 lg:h-44 group cursor-pointer">
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors">
                              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                              </svg>
                            </div>
                          </div>
                          <div className="relative p-3 mt-auto flex flex-col justify-end h-full">
                            <div className="absolute inset-0" />
                            <div className="relative mt-auto">
                              <span className="text-[9px] text-red-300 font-medium">{article.source}</span>
                              <h4 className="text-white font-bold text-sm line-clamp-2 drop-shadow">{article.title}</h4>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ===== Галерей ===== */}
            <GallerySection />
          </>
        )}

        <div className="max-w-6xl mx-auto px-4 py-3">
          <AdBanner position="footer" />
        </div>
      </div>
    </>
  );
}
