"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sources, setSources] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef(null);
  const timerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/articles/sources")
      .then((r) => r.ok ? r.json() : [])
      .then(setSources)
      .catch(() => {});
  }, []);

  // Click outside хаах
  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      fetch(`/api/articles/suggest?q=${encodeURIComponent(val.trim())}`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        })
        .catch(() => {});
    }, 300);
  }

  function handleSearch(e) {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (source) params.set("source", source);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function clearFilters() {
    setQuery("");
    setSource("");
    setDateFrom("");
    setDateTo("");
    router.push("/");
  }

  const hasFilters = source || dateFrom || dateTo;

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1" ref={suggestRef}>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Мэдээ хайх..."
            className="w-full px-4 py-2.5 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/article/${s.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="block px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700 last:border-b-0"
                >
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-1">{s.title}</p>
                  <div className="flex gap-2 mt-0.5">
                    {s.category && (
                      <span className="text-xs text-purple-500">{s.category}</span>
                    )}
                    <span className="text-xs text-gray-400">{s.source}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 border rounded-lg transition-colors ${
            showFilters || hasFilters
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          title="Шүүлтүүр"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Хайх
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Эх сурвалж
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Бүгд</option>
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Эхлэх огноо
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Дуусах огноо
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Шүүлтүүр арилгах
            </button>
          )}
        </div>
      )}
    </form>
  );
}
