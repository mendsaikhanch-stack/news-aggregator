const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function getArticles({ search, category, skip = 0, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  params.set("skip", skip);
  params.set("limit", limit);

  const res = await fetch(`${API_BASE}/api/articles?${params}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getArticle(id) {
  const res = await fetch(`${API_BASE}/api/articles/${id}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function fetchNewArticles() {
  const res = await fetch(`${API_BASE}/api/articles/fetch`, {
    method: "POST",
  });
  return res.json();
}
