"use client";

import { useState } from "react";
import Header from "../../components/Header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.access_token);
        setMessage("Амжилттай нэвтэрлээ!");
      } else {
        setMessage(data.detail || "Нэвтрэх амжилтгүй");
      }
    } catch {
      setMessage("Сервертэй холбогдож чадсангүй");
    }
  };

  const authFetch = async (url, method = "GET") => {
    return fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchNews = async () => {
    setLoading(true);
    setMessage("Мэдээ татаж байна...");
    try {
      const res = await authFetch(`${API_BASE}/api/articles/fetch`, "POST");
      const data = await res.json();
      setMessage(data.message || data.detail);
    } catch {
      setMessage("Алдаа гарлаа");
    }
    setLoading(false);
  };

  const clearNews = async () => {
    if (!confirm("Бүх мэдээг устгах уу?")) return;
    try {
      const res = await authFetch(`${API_BASE}/api/articles/clear`, "DELETE");
      const data = await res.json();
      setMessage(data.message || data.detail);
    } catch {
      setMessage("Алдаа гарлаа");
    }
  };

  const loadStats = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/stats`);
      const data = await res.json();
      if (res.ok) setStats(data);
      else setMessage(data.detail);
    } catch {
      setMessage("Алдаа гарлаа");
    }
  };

  // Нэвтрээгүй бол login form
  if (!token) {
    return (
      <>
        <Header />
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Админ нэвтрэх
            </h2>
            <input
              type="text"
              placeholder="Нэвтрэх нэр"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full border rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={login}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Нэвтрэх
            </button>
            {message && (
              <p className="mt-4 text-center text-sm text-red-600">{message}</p>
            )}
          </div>
        </main>
      </>
    );
  }

  // Админ dashboard
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Админ удирдлага</h2>
          <button
            onClick={() => { setToken(""); setStats(null); }}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Гарах
          </button>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
            {message}
          </div>
        )}

        {/* Үйлдлүүд */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={fetchNews}
            disabled={loading}
            className="bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Татаж байна..." : "Мэдээ татах"}
          </button>
          <button
            onClick={clearNews}
            className="bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Бүх мэдээ устгах
          </button>
          <button
            onClick={loadStats}
            className="bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Статистик харах
          </button>
        </div>

        {/* Статистик */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-1">Нийт мэдээ</h3>
              <p className="text-4xl font-black text-blue-700">{stats.total_articles}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-3">Хэлээр</h3>
              {Object.entries(stats.by_language).map(([lang, count]) => (
                <div key={lang} className="flex justify-between py-1">
                  <span className="text-gray-600">{lang === "mn" ? "Монгол" : "Англи"}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-3">Эх сурвалжаар</h3>
              {Object.entries(stats.by_source)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex justify-between py-1">
                    <span className="text-gray-600">{source}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-3">Ангилалаар</h3>
              {Object.entries(stats.by_category)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex justify-between py-1">
                    <span className="text-gray-600">{cat}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-3">Бүс нутгаар</h3>
              {Object.entries(stats.by_region)
                .sort((a, b) => b[1] - a[1])
                .map(([region, count]) => (
                  <div key={region} className="flex justify-between py-1">
                    <span className="text-gray-600">{region}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
