const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SITE_URL = process.env.SITE_URL || "https://geregnews.mn";

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const res = await fetch(`${API_BASE}/api/articles?limit=200`, { cache: "no-store" });
    if (!res.ok) return staticPages;
    const articles = await res.json();

    const articlePages = articles.map((article) => ({
      url: `${SITE_URL}/article/${article.id}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
