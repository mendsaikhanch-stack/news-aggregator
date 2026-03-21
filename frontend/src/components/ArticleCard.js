import Link from "next/link";

export default function ArticleCard({ article }) {
  return (
    <Link href={`/article/${article.id}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4 cursor-pointer h-full">
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-48 object-cover rounded-md mb-3"
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
