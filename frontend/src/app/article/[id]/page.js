import Header from "../../../components/Header";
import AdBanner from "../../../components/AdBanner";
import Link from "next/link";
import { getArticle } from "../../../lib/api";

export default async function ArticlePage({ params }) {
  const { id } = await params;
  let article = null;

  try {
    article = await getArticle(id);
  } catch {
    // Backend холбогдоогүй
  }

  if (!article || article.error) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Мэдээ олдсонгүй</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
            Нүүр хуудас руу буцах
          </Link>
        </main>
      </>
    );
  }

  const contentParagraphs = (article.translated_content || article.full_content || "")
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-4 block"
        >
          ← Нүүр хуудас
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">
              {article.source}
            </span>
            {article.region && (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded">
                {article.region}
              </span>
            )}
            {article.category && (
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded">
                {article.category}
              </span>
            )}
            {article.published_at && (
              <span className="text-sm text-gray-400">
                {new Date(article.published_at).toLocaleDateString("mn-MN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" · "}
                {new Date(article.published_at).toLocaleTimeString("mn-MN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg mb-6"
            />
          )}

          {/* Зар */}
          <div className="my-4">
            <AdBanner position="between_articles" />
          </div>

          {article.ai_summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Хураангуй
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {article.ai_summary}
              </p>
            </div>
          )}

          {contentParagraphs.length > 0 ? (
            <div className="prose max-w-none">
              {contentParagraphs.map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            article.summary && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            )
          )}

          <div className="mt-8 pt-4 border-t flex items-center justify-between">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Эх сурвалж руу очих →
            </a>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← Бусад мэдээ
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
