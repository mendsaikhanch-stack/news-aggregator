"use client";

import { useState, useEffect } from "react";

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
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    fetch("https://wttr.in/Ulaanbaatar?format=j1")
      .then((r) => r.json())
      .then((data) => {
        const c = data.current_condition?.[0];
        if (c) {
          setWeather({
            temp: c.temp_C,
            feels: c.FeelsLikeC,
            desc: c.weatherDesc?.[0]?.value || "N/A",
            humidity: c.humidity,
            wind: c.windspeedKmph,
          });
        }
        const days = data.weather?.slice(0, 3) || [];
        setForecast(
          days.map((d) => ({
            date: d.date,
            max: d.maxtempC,
            min: d.mintempC,
            desc: d.hourly?.[4]?.weatherDesc?.[0]?.value || "",
          }))
        );
      })
      .catch(() => {});
  }, []);

  const DAYS_MN = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];

  return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Цаг агаар · Улаанбаатар</h3>
        <span className="text-xs text-sky-200">
          {new Date().toLocaleDateString("mn-MN", { month: "short", day: "numeric" })}
        </span>
      </div>
      {!weather ? (
        <div className="flex items-center gap-2 py-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-sm text-sky-200">Ачааллаж байна...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{getIcon(weather.desc)}</span>
            <div>
              <span className="text-4xl font-black">{weather.temp}°</span>
              <span className="text-lg text-sky-200 ml-1">C</span>
            </div>
            <div className="text-xs text-sky-100 ml-auto space-y-0.5">
              <p>{weather.desc}</p>
              <p>Мэдрэгдэх: {weather.feels}°C</p>
              <p>Чийг: {weather.humidity}%</p>
              <p>Салхи: {weather.wind} км/ц</p>
            </div>
          </div>
          {forecast.length > 0 && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/20">
              {forecast.map((f, i) => {
                const d = new Date(f.date);
                return (
                  <div key={i} className="flex-1 text-center text-xs">
                    <p className="text-sky-200 font-medium">{DAYS_MN[d.getDay()]}</p>
                    <p className="text-lg my-0.5">{getIcon(f.desc)}</p>
                    <p className="font-semibold">{f.max}°/{f.min}°</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
