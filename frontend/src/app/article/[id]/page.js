import Header from "../../../components/Header";
import AdBanner from "../../../components/AdBanner";
import BookmarkButton from "../../../components/BookmarkButton";
import Link from "next/link";
import { getArticle } from "../../../lib/api";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const article = await getArticle(id);
    if (!article || article.error) return { title: "Мэдээ олдсонгүй" };
    const description = (article.ai_summary || article.summary || "").slice(0, 160);
    return {
      title: `${article.title} | GEREGNEWS.MN`,
      description,
      openGraph: {
        title: article.title,
        description,
        type: "article",
        publishedTime: article.published_at,
        images: article.image_url ? [{ url: article.image_url }] : [],
        siteName: "GEREGNEWS.MN",
      },
      twitter: {
        card: article.image_url ? "summary_large_image" : "summary",
        title: article.title,
        description,
        images: article.image_url ? [article.image_url] : [],
      },
    };
  } catch {
    return { title: "GEREGNEWS.MN" };
  }
}

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
          <p className="text-gray-500 dark:text-gray-400">Мэдээ олдсонгүй</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
            Нүүр хуудас руу буцах
          </Link>
        </main>
      </>
    );
  }

  // translated_content-г хэсэг хэсгээр задлах
  const rawContent = article.translated_content || article.full_content || "";
  let mainText = rawContent;
  let keyPoints = "";
  let mongoliaImpact = "";

  // Бүтэцтэй хариу байвал задлах
  const keyPointsMatch = rawContent.match(/\n\nГол санаанууд:\n([\s\S]*?)(?=\n\nМонголд үзүүлэх нөлөө:|\n*$)/);
  const impactMatch = rawContent.match(/\n\nМонголд үзүүлэх нөлөө:\n([\s\S]*?)$/);

  if (keyPointsMatch) {
    keyPoints = keyPointsMatch[1].trim();
    mainText = rawContent.substring(0, rawContent.indexOf("\n\nГол санаанууд:")).trim();
  }
  if (impactMatch) {
    mongoliaImpact = impactMatch[1].trim();
    if (!keyPointsMatch) {
      mainText = rawContent.substring(0, rawContent.indexOf("\n\nМонголд үзүүлэх нөлөө:")).trim();
    }
  }

  const contentParagraphs = mainText
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-4 md:py-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-4 block"
        >
          ← Нүүр хуудас
        </Link>

        <article>
          {/* Мета мэдээлэл */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded">
              {article.source}
            </span>
            {article.region && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded">
                {article.region}
              </span>
            )}
            {article.category && (
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded">
                {article.category}
              </span>
            )}
            {article.published_at && (
              <span className="text-sm text-gray-400 dark:text-gray-500">
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

          {/* Гарчиг */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {article.title}
          </h1>

          {/* Зураг */}
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

          {/* Хураангуй */}
          {article.ai_summary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Товч агуулга
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.ai_summary}
              </p>
            </div>
          )}

          {/* Гол санаанууд */}
          {keyPoints && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                Гол санаанууд
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm space-y-1">
                {keyPoints.split("\n").map((point, i) => (
                  <p key={i}>{point}</p>
                ))}
              </div>
            </div>
          )}

          {/* Бүтэн агуулга */}
          {contentParagraphs.length > 0 ? (
            <div className="prose dark:prose-invert max-w-none">
              {contentParagraphs.map((paragraph, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            article.summary && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            )
          )}

          {/* Монголд үзүүлэх нөлөө */}
          {mongoliaImpact && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                Монголд үзүүлэх нөлөө
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {mongoliaImpact}
              </p>
            </div>
          )}

          {/* Доод хэсэг */}
          <div className="mt-8 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Эх сурвалж руу очих →
            </a>
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              ← Бусад мэдээ
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
