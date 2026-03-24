"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import CategoryBar from "../../components/CategoryBar";
import ArticleCard from "../../components/ArticleCard";
import { useAuth } from "../../context/AuthContext";

export default function BookmarksPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchBookmarks();
  }, [user, authLoading]);

  async function fetchBookmarks() {
    try {
      const res = await authFetch("/api/bookmarks?limit=100");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.items || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <CategoryBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
          Хадгалсан мэдээ
        </h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-xl mb-2">Хадгалсан мэдээ алга</p>
            <p className="text-sm">Мэдээний зүрхэн дээр дарж хадгалаарай</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
