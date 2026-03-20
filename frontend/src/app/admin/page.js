"use client";

import { useState } from "react";
import Header from "../../components/Header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [adForm, setAdForm] = useState({ title: "", image_url: "", link_url: "", position: "header" });

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

  const authFetch = async (url, method = "GET", body = null) => {
    const opts = {
      method,
      headers: { Authorization: `Bearer ${token}` },
    };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts);
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

  const loadAds = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/ads/all`);
      const data = await res.json();
      if (res.ok) setAds(data);
      else setMessage(data.detail);
    } catch {
      setMessage("Алдаа гарлаа");
    }
  };

  const createAd = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/ads`, "POST", adForm);
      const data = await res.json();
      if (res.ok) {
        setMessage("Зар нэмэгдлээ!");
        setShowAdForm(false);
        setAdForm({ title: "", image_url: "", link_url: "", position: "header" });
        loadAds();
      } else {
        setMessage(data.detail);
      }
    } catch {
      setMessage("Алдаа гарлаа");
    }
  };

  const toggleAd = async (ad) => {
    await authFetch(`${API_BASE}/api/ads/${ad.id}`, "PUT", { is_active: ad.is_active ? 0 : 1 });
    loadAds();
  };

  const deleteAd = async (id) => {
    if (!confirm("Зар устгах уу?")) return;
    await authFetch(`${API_BASE}/api/ads/${id}`, "DELETE");
    loadAds();
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

        {/* Сурталчилгаа удирдлага */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Сурталчилгаа</h3>
            <div className="flex gap-2">
              <button
                onClick={loadAds}
                className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Жагсаалт
              </button>
              <button
                onClick={() => setShowAdForm(!showAdForm)}
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                + Шинэ зар
              </button>
            </div>
          </div>

          {/* Зар нэмэх form */}
          {showAdForm && (
            <div className="bg-white rounded-xl shadow p-6 mb-4">
              <h4 className="font-semibold mb-3">Шинэ зар нэмэх</h4>
              <input
                type="text"
                placeholder="Зарын гарчиг"
                value={adForm.title}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Зургийн URL (заавал биш)"
                value={adForm.image_url}
                onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Холбоос URL"
                value={adForm.link_url}
                onChange={(e) => setAdForm({ ...adForm, link_url: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={adForm.position}
                onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="header">Толгой хэсэг (Header)</option>
                <option value="between_articles">Мэдээний дунд</option>
                <option value="sidebar">Хажуу самбар (Sidebar)</option>
                <option value="footer">Хөл хэсэг (Footer)</option>
              </select>
              <button
                onClick={createAd}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Нэмэх
              </button>
            </div>
          )}

          {/* Зарын жагсаалт */}
          {ads.length > 0 && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3">Гарчиг</th>
                    <th className="px-4 py-3">Байрлал</th>
                    <th className="px-4 py-3">Төлөв</th>
                    <th className="px-4 py-3 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ads.map((ad) => (
                    <tr key={ad.id}>
                      <td className="px-4 py-3 font-medium">{ad.title}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {ad.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAd(ad)}
                          className={`text-xs px-2 py-1 rounded ${
                            ad.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {ad.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Устгах
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
