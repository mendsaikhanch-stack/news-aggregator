import Header from "../../../components/Header";
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

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-4 block"
        >
          ← Буцах
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">
              {article.source}
            </span>
            {article.published_at && (
              <span className="text-sm text-gray-400">
                {new Date(article.published_at).toLocaleDateString("mn-MN")}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg mb-6"
            />
          )}

          {article.ai_summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                AI Хураангуй
              </h3>
              <p className="text-gray-700">{article.ai_summary}</p>
            </div>
          )}

          {article.summary && (
            <p className="prose max-w-none text-gray-700">
              {article.summary}
            </p>
          )}

          <div className="mt-8 pt-4 border-t">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Эх сурвалж руу очих →
            </a>
          </div>
        </article>
      </main>
    </>
  );
}
