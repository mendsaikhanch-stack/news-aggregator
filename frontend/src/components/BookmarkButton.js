"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function BookmarkButton({ articleId, size = "md" }) {
  const { user, authFetch } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Хадгалсан эсэхийг шалгах (bookmark IDs-ээс cache ашиглаж болно)
    const cached = window.__bookmarkIds;
    if (cached) {
      setSaved(cached.includes(articleId));
    }
  }, [user, articleId]);

  // Global bookmark IDs cache-г нэг удаа татах
  useEffect(() => {
    if (!user || window.__bookmarkIds) return;
    authFetch("/api/bookmarks/ids")
      .then((r) => r.ok ? r.json() : [])
      .then((ids) => {
        window.__bookmarkIds = ids;
        setSaved(ids.includes(articleId));
      })
      .catch(() => {});
  }, [user]);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;

    setLoading(true);
    try {
      if (saved) {
        await authFetch(`/api/bookmarks/${articleId}`, { method: "DELETE" });
        setSaved(false);
        if (window.__bookmarkIds) {
          window.__bookmarkIds = window.__bookmarkIds.filter((id) => id !== articleId);
        }
      } else {
        await authFetch(`/api/bookmarks/${articleId}`, { method: "POST" });
        setSaved(true);
        if (window.__bookmarkIds) {
          window.__bookmarkIds.push(articleId);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${sizeClasses} flex items-center justify-center rounded-full transition-all ${
        saved
          ? "bg-red-500 text-white shadow-md"
          : "bg-white/80 dark:bg-gray-700/80 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-600 shadow"
      } ${loading ? "opacity-50" : ""}`}
      title={saved ? "Хадгалсанаас хасах" : "Хадгалах"}
    >
      <svg className={iconSize} fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
