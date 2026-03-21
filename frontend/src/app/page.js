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
    if (a.is_video === 1) {
      bucket.videos.push(a);
    } else {
      bucket.regular.push(a);
    }
  });

  return grouped;
}

// Hero: нүүр хуудасны толгойн мэдээ
function HeroSection({ articles }) {
  if (articles.length === 0) return null;
  const main = articles[0];
  const sides = articles.slice(1, 4);

  return (
    <section className="max-w-6xl mx-auto px-4 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Main hero */}
        <div className="lg:col-span-3">
          <Link href={`/article/${main.id}`}>
            <div className="relative rounded-xl overflow-hidden bg-gray-900 h-[340px] md:h-[400px] group cursor-pointer">
              {main.image_url ? (
                <img
                  src={main.image_url}
                  alt={main.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-800 to-indigo-900" />
              )}
              <div className="hero-overlay absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    ШИНЭ
                  </span>
                  <span className="text-white/80 text-xs">{main.source}</span>
                  {main.published_at && (
                    <span className="text-white/60 text-xs">
                      {new Date(main.published_at).toLocaleDateString("mn-MN")}
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight line-clamp-3 drop-shadow-lg">
                  {main.title}
                </h2>
                {main.ai_summary && (
                  <p className="text-white/80 text-sm mt-2 line-clamp-2 hidden md:block">
                    {main.ai_summary}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Side stories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {sides.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`}>
              <div className="flex gap-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-3 cursor-pointer h-full">
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-28 h-24 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {article.source}
                      </span>
                      {article.is_video === 1 && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          ▶
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                  </div>
                  {article.published_at && (
                    <span className="text-[10px] text-gray-400 mt-1">
                      {new Date(article.published_at).toLocaleDateString("mn-MN")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Нэг ангиллын хэсэг
function CategorySection({ category, regular, videos, isAI }) {
  if (regular.length === 0 && videos.length === 0) return null;

  // AI-тай холбоотой мэдээг tech хэсэгт онцлох
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
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-blue-700 rounded-full" />
          <h2 className="text-xl md:text-2xl font-black text-gray-900">
            {category.icon} {category.label}
          </h2>
        </div>
        <Link
          href={`/?category=${category.key}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Бүгдийг харах →
        </Link>
      </div>

      {/* AI тусгай мэдээ (зөвхөн tech хэсэгт) */}
      {aiArticle && (
        <div className="mb-5">
          <Link href={`/article/${aiArticle.id}`}>
            <div className="relative bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl p-4 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded">
                  🤖 AI МЭДЭЭ
                </span>
                <span className="text-xs text-violet-200">{aiArticle.source}</span>
              </div>
              <h3 className="text-lg font-bold line-clamp-2">{aiArticle.title}</h3>
              {aiArticle.ai_summary && (
                <p className="text-violet-100 text-sm mt-1 line-clamp-2">
                  {aiArticle.ai_summary}
                </p>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* First article large */}
        {otherArticles[0] && (
          <div className="md:col-span-2 md:row-span-2">
            <Link href={`/article/${otherArticles[0].id}`}>
              <div className="relative rounded-xl overflow-hidden bg-gray-900 h-full min-h-[280px] group cursor-pointer">
                {otherArticles[0].image_url ? (
                  <img
                    src={otherArticles[0].image_url}
                    alt={otherArticles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
                <div className="hero-overlay absolute inset-0" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[10px] font-semibold text-blue-300 bg-blue-900/50 px-1.5 py-0.5 rounded">
                    {otherArticles[0].source}
                  </span>
                  <h3 className="text-lg font-bold text-white line-clamp-3 mt-1.5 drop-shadow">
                    {otherArticles[0].title}
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Rest of articles */}
        {otherArticles.slice(1, 7).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Video мэдээ (хэсгийн доод хэсэгт) */}
      {videos.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-200">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-red-500">▶</span> Видео мэдээ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <div className="relative rounded-lg overflow-hidden bg-gray-900 h-48 group cursor-pointer">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-800 to-gray-900" />
                  )}
                  <div className="hero-overlay absolute inset-0" />
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold text-red-300 bg-red-900/60 px-1.5 py-0.5 rounded">
                        {article.source}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-2 drop-shadow">
                      {article.title}
                    </h4>
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

// Хайлт/шүүлтүүрийн үр дүн (category эсвэл search горимд)
function FilteredResults({ articles, search, category }) {
  const catInfo = CATEGORIES.find((c) => c.key === category);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-6">
        <SearchBar />
      </div>

      {search && (
        <p className="text-gray-500 text-sm mb-4">
          &ldquo;{search}&rdquo; хайлтын үр дүн: {articles.length} мэдээ
        </p>
      )}
      {catInfo && (
        <h2 className="text-2xl font-black mb-4">
          {catInfo.icon} {catInfo.label}
        </h2>
      )}

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-2">Мэдээ олдсонгүй</p>
          <p className="text-sm">
            Backend серверийг ажиллуулж,{" "}
            <code>POST /api/articles/fetch</code> дуудан мэдээ татна уу.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </main>
  );
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "";

  let articles = [];
  try {
    articles = await getArticles({ search, category, limit: 100 });
  } catch {
    // Backend холбогдоогүй
  }

  // Хайлт эсвэл ангилал сонгосон бол шүүсэн үр дүн харуулна
  if (search || category) {
    return (
      <>
        <Header />
        <StockTicker />
        <CategoryBar />
        <FilteredResults articles={articles} search={search} category={category} />
        <AdBanner position="footer" />
      </>
    );
  }

  // Нүүр хуудас: BBC/Reuters загвар
  const grouped = groupArticles(articles);
  const heroArticles = articles.slice(0, 4);
  // Ангилал бүрээс hero-д ашигласан мэдээг хасах
  const heroIds = new Set(heroArticles.map((a) => a.id));
  Object.values(grouped).forEach((g) => {
    g.regular = g.regular.filter((a) => !heroIds.has(a.id));
    g.videos = g.videos.filter((a) => !heroIds.has(a.id));
  });

  // Бүх видео мэдээг бас цуглуулах (хамгийн доод хэсэгт)
  const allVideos = articles.filter((a) => a.is_video === 1 && !heroIds.has(a.id));

  return (
    <>
      <Header />
      <StockTicker />
      <CategoryBar />

      <div className="relative">
        {/* Background overlay */}
        <div className="fixed inset-0 -z-10 bg-mongolia-overlay" />

        {/* Search */}
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex justify-center">
            <SearchBar />
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-2">Мэдээ олдсонгүй</p>
            <p className="text-sm">
              Backend серверийг ажиллуулж,{" "}
              <code>POST /api/articles/fetch</code> дуудан мэдээ татна уу.
            </p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <HeroSection articles={heroArticles} />

            {/* Зар */}
            <div className="max-w-6xl mx-auto px-4 py-3">
              <AdBanner position="header" />
            </div>

            {/* Цаг агаар + Зурхай */}
            <section className="max-w-6xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WeatherWidget />
                <ZurkhaiWidget />
              </div>
            </section>

            {/* Ангилал бүрээр мэдээ */}
            {CATEGORIES.map((cat, i) => (
              <div key={cat.key}>
                <CategorySection
                  category={cat}
                  regular={grouped[cat.key].regular}
                  videos={grouped[cat.key].videos}
                  isAI={cat.key === "tech"}
                />
                {/* 2 ангилал тутамд зар */}
                {i % 2 === 1 && i < CATEGORIES.length - 1 && (
                  <div className="max-w-6xl mx-auto px-4">
                    <AdBanner position="between_articles" />
                  </div>
                )}
              </div>
            ))}

            {/* Галерей */}
            <GallerySection />

            {/* Бүх видео мэдээ (хамгийн доод хэсэгт) */}
            {allVideos.length > 0 && (
              <section className="bg-gray-900 py-10">
                <div className="max-w-6xl mx-auto px-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-red-500 rounded-full" />
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        Видео мэдээ
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Бүх эх сурвалжаас
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {allVideos.slice(0, 8).map((article) => (
                      <Link key={article.id} href={`/article/${article.id}`}>
                        <div className="relative rounded-lg overflow-hidden bg-gray-800 h-48 group cursor-pointer">
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-900 to-gray-900" />
                          )}
                          <div className="hero-overlay absolute inset-0" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <span className="text-[10px] font-semibold text-red-300 bg-red-900/60 px-1.5 py-0.5 rounded">
                              {article.source}
                            </span>
                            <h4 className="text-sm font-bold text-white line-clamp-2 mt-1 drop-shadow">
                              {article.title}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Footer зар */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdBanner position="footer" />
        </div>
      </div>
    </>
  );
}
