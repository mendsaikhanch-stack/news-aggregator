import Link from "next/link";

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

function PlaceholderImage({ category, source, className }) {
  const gradient = CATEGORY_GRADIENTS[category] || "from-gray-600 to-gray-800";
  const icon = CATEGORY_ICONS[category] || "📰";
  return (
    <div className={`bg-gradient-to-br ${gradient} ${className} flex flex-col items-center justify-center`}>
      <span className="text-3xl mb-1 opacity-80">{icon}</span>
      <span className="text-white/60 text-[10px] font-medium">{source}</span>
    </div>
  );
}

export default function ArticleCard({ article }) {
  return (
    <Link href={`/article/${article.id}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4 cursor-pointer h-full">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-40 md:h-48 object-cover rounded-md mb-3"
          />
        ) : (
          <PlaceholderImage
            category={article.category}
            source={article.source}
            className="w-full h-40 md:h-48 rounded-md mb-3"
          />
        )}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {article.source}
          </span>
          {article.region && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {article.region}
            </span>
          )}
          {article.is_video === 1 && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              ▶ Видео
            </span>
          )}
          {article.published_at && (
            <span className="text-xs text-gray-400">
              {new Date(article.published_at).toLocaleDateString("mn-MN")}
              {" · "}
              {new Date(article.published_at).toLocaleTimeString("mn-MN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h2>
        {article.ai_summary && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {article.ai_summary}
          </p>
        )}
        {!article.ai_summary && article.summary && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {article.summary.replace(/<[^>]*>/g, "")}
          </p>
        )}
        <div className="mt-3 text-xs text-blue-500 font-medium">
          Дэлгэрэнгүй унших →
        </div>
      </div>
    </Link>
  );
}
