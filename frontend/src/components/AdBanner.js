"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdBanner({ position }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/ads?position=${position}`)
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch(() => {});
  }, [position]);

  if (ads.length === 0) return null;

  const ad = ads[Math.floor(Math.random() * ads.length)];

  const styles = {
    header: "max-w-6xl mx-auto px-4 py-2",
    sidebar: "w-full",
    between_articles: "col-span-full max-w-4xl mx-auto w-full px-4 py-2",
    footer: "max-w-6xl mx-auto px-4 py-2",
  };

  return (
    <div className={styles[position] || ""}>
      <a
        href={ad.link_url || "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt={ad.title}
              className={
                position === "between_articles" || position === "header"
                  ? "w-full h-24 object-cover"
                  : "w-full h-40 object-cover"
              }
            />
          ) : (
            <div
              className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-center px-4 ${
                position === "between_articles" || position === "header"
                  ? "h-20 text-base"
                  : "h-32 text-lg"
              }`}
            >
              {ad.title}
            </div>
          )}
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs text-gray-400">Сурталчилгаа</span>
            {ad.image_url && (
              <span className="text-xs font-medium text-gray-600 truncate ml-2">
                {ad.title}
              </span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
