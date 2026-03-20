import Header from "../components/Header";
import CategoryBar from "../components/CategoryBar";
import SearchBar from "../components/SearchBar";
import ArticleCard from "../components/ArticleCard";
import { getArticles } from "../lib/api";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "";
  let articles = [];

  try {
    articles = await getArticles({ search, category });
  } catch {
    // Backend холбогдоогүй бол хоосон жагсаалт
  }

  return (
    <>
      <Header />
      <CategoryBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <SearchBar />
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-2">Мэдээ олдсонгүй</p>
            <p className="text-sm">
              Backend серверийг ажиллуулж, <code>POST /api/articles/fetch</code>{" "}
              дуудан мэдээ татна уу.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
