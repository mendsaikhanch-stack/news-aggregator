"use client";

import { useState, useEffect } from "react";

const CITIES = [
  { name: "Улаанбаатар", query: "Ulaanbaatar", flag: "🇲🇳" },
  { name: "Токио", query: "Tokyo", flag: "🇯🇵" },
  { name: "Бээжин", query: "Beijing", flag: "🇨🇳" },
  { name: "Сөүл", query: "Seoul", flag: "🇰🇷" },
  { name: "Москва", query: "Moscow", flag: "🇷🇺" },
  { name: "Нью-Йорк", query: "New+York", flag: "🇺🇸" },
  { name: "Лондон", query: "London", flag: "🇬🇧" },
  { name: "Берлин", query: "Berlin", flag: "🇩🇪" },
];

const WEATHER_ICONS = {
  "Clear": "☀️", "Sunny": "☀️",
  "Partly cloudy": "⛅", "Partly Cloudy": "⛅",
  "Cloudy": "☁️", "Overcast": "☁️",
  "Mist": "🌫️", "Fog": "🌫️",
  "Light rain": "🌦️", "Rain": "🌧️", "Heavy rain": "🌧️",
  "Light snow": "🌨️", "Snow": "❄️", "Heavy snow": "❄️",
  "Thunderstorm": "⛈️", "Blizzard": "🌪️",
};

function getIcon(desc) {
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (desc?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "🌤️";
}

export default function WeatherWidget() {
  const [cities, setCities] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Бүх хотын цаг агаарыг нэг дор татах
    Promise.all(
      CITIES.map((city) =>
        fetch(`https://wttr.in/${city.query}?format=j1`)
          .then((r) => r.json())
          .then((data) => {
            const c = data.current_condition?.[0];
            return {
              ...city,
              temp: c?.temp_C || "—",
              desc: c?.weatherDesc?.[0]?.value || "",
              feels: c?.FeelsLikeC || "—",
            };
          })
          .catch(() => ({ ...city, temp: "—", desc: "", feels: "—" }))
      )
    ).then(setCities);

    // Цагийг шинэчлэх
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  function getCityTime(query) {
    const tzMap = {
      Ulaanbaatar: "Asia/Ulaanbaatar",
      Tokyo: "Asia/Tokyo",
      Beijing: "Asia/Shanghai",
      Seoul: "Asia/Seoul",
      Moscow: "Europe/Moscow",
      "New+York": "America/New_York",
      London: "Europe/London",
      Berlin: "Europe/Berlin",
    };
    try {
      return now.toLocaleTimeString("mn-MN", {
        timeZone: tzMap[query],
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "—";
    }
  }

  return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-lg p-3 text-white shadow">
      <h3 className="font-bold text-xs mb-2">🌍 Дэлхийн цаг агаар</h3>
      {cities.length === 0 ? (
        <div className="flex items-center gap-2 py-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-xs text-sky-200">Ачааллаж байна...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {cities.map((c) => (
            <div key={c.query} className="bg-white/10 rounded-md px-2 py-1.5 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px]">{c.flag}</span>
                <span className="text-[10px] font-medium truncate">{c.name}</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-sm">{getIcon(c.desc)}</span>
                <span className="text-sm font-black">{c.temp}°</span>
              </div>
              <p className="text-[9px] text-sky-200 mt-0.5">{getCityTime(c.query)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
