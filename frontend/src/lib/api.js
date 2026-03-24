// Server-side (Node.js) дээр full URL хэрэгтэй, client-side дээр proxy ашиглана
const isServer = typeof window === "undefined";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (isServer ? "http://localhost:8000" : "");

export async function getArticles({ search, category, source, date_from, date_to, skip = 0, limit = 20 } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (source) params.set("source", source);
    if (date_from) params.set("date_from", date_from);
    if (date_to) params.set("date_to", date_to);
    params.set("skip", skip);
    params.set("limit", limit);

    const res = await fetch(`${API_BASE}/api/articles?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getVideos({ limit = 20 } = {}) {
  try {
    const params = new URLSearchParams();
    params.set("is_video", "1");
    params.set("limit", limit);

    const res = await fetch(`${API_BASE}/api/articles?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getArticle(id) {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch article ${id}: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function fetchNewArticles() {
  const res = await fetch(`${API_BASE}/api/articles/fetch`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to fetch new articles: ${res.status}`);
  return res.json();
}
