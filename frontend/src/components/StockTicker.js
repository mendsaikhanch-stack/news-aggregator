"use client";

import { useState, useEffect } from "react";

const INDICES = [
  { symbol: "S&P 500", base: 5892 },
  { symbol: "NASDAQ", base: 18923 },
  { symbol: "DOW JONES", base: 42840 },
  { symbol: "FTSE 100", base: 8654 },
  { symbol: "NIKKEI 225", base: 38420 },
  { symbol: "DAX", base: 22890 },
  { symbol: "HANG SENG", base: 23150 },
  { symbol: "KOSPI", base: 2580 },
  { symbol: "ASX 200", base: 8120 },
  { symbol: "SHANGHAI", base: 3370 },
];

const CURRENCIES = [
  { symbol: "USD/MNT", base: 3428 },
  { symbol: "EUR/USD", base: 1.0875 },
  { symbol: "CNY/MNT", base: 472 },
  { symbol: "RUB/MNT", base: 37.2 },
  { symbol: "KRW/MNT", base: 2.48 },
  { symbol: "JPY/MNT", base: 22.8 },
];

const COMMODITIES = [
  { symbol: "АЛТНЫ ХАНШ", base: 3028.5 },
  { symbol: "МӨНГӨ", base: 33.8 },
  { symbol: "BRENT OIL", base: 71.2 },
  { symbol: "ЗЭСИЙН ХАНШ", base: 9450 },
  { symbol: "BTC/USD", base: 84200 },
];

// Монголын хөрөнгийн биржийн (MSE) компаниуд
const MSE_STOCKS = [
  { symbol: "APU", name: "АПУ", base: 1250 },
  { symbol: "GOV", name: "Говь", base: 3180 },
  { symbol: "SUU", name: "Сүү", base: 420 },
  { symbol: "MNP", name: "Монгол пост", base: 380 },
  { symbol: "TTL", name: "Тавантолгой", base: 48500 },
  { symbol: "ADU", name: "Адуунчулуун", base: 12800 },
  { symbol: "BDL", name: "Бодлогын далай", base: 890 },
  { symbol: "MIE", name: "МИЕ", base: 265 },
  { symbol: "EER", name: "Эрдэнэ", base: 1580 },
  { symbol: "BNG", name: "Баянголмэт", base: 3420 },
  { symbol: "HRM", name: "Хэрмэн", base: 520 },
  { symbol: "JTB", name: "Жист Тавилга", base: 185 },
  { symbol: "MCH", name: "Мах Импекс", base: 710 },
  { symbol: "MMX", name: "Монголын зэс", base: 2850 },
  { symbol: "SHV", name: "Шивээ-Овоо", base: 680 },
  { symbol: "TOP20", name: "ТОП 20 Индекс", base: 28450 },
  { symbol: "MSE A", name: "MSE-А Индекс", base: 18920 },
];

function generatePrice(item) {
  const now = new Date();
  const seed = now.getHours() * 60 + now.getMinutes();
  const variance = (Math.sin(seed * 0.1 + item.symbol.length) * 0.5 +
                    Math.cos(seed * 0.05 + item.symbol.charCodeAt(0)) * 0.3);
  const changePct = Number((variance * 1.5).toFixed(2));
  const price = Number((item.base * (1 + changePct / 100)).toFixed(item.base < 10 ? 4 : 2));
  return { ...item, price, change: changePct };
}

function TickerRow({ items, label, labelColor, bgColor, borderColor, direction }) {
  return (
    <div className={`${bgColor} text-white overflow-hidden h-8 flex items-center ${borderColor}`}>
      {label && (
        <div className={`${labelColor} px-3 h-full flex items-center flex-shrink-0 z-10`}>
          <span className="text-[10px] font-black tracking-wider whitespace-nowrap">{label}</span>
        </div>
      )}
      <div className={`${direction === "right" ? "animate-ticker-reverse" : "animate-ticker"} flex whitespace-nowrap`}>
        {[...items, ...items].map((s, i) => (
          <span key={i} className="mx-5 text-xs inline-flex items-center gap-1.5">
            <span className="font-medium text-gray-400">{s.name || s.symbol}</span>
            {s.name && <span className="text-gray-500 text-[10px]">({s.symbol})</span>}
            <span className="text-white font-semibold">{s.price.toLocaleString()}₮</span>
            <span className={`font-medium ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {s.change >= 0 ? "▲" : "▼"}{Math.abs(s.change)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StockTicker() {
  const [worldStocks, setWorldStocks] = useState([]);
  const [mseStocks, setMseStocks] = useState([]);

  useEffect(() => {
    const worldAll = [...INDICES, ...CURRENCIES, ...COMMODITIES];
    setWorldStocks(worldAll.map(generatePrice));
    setMseStocks(MSE_STOCKS.map(generatePrice));
    const interval = setInterval(() => {
      setWorldStocks(worldAll.map(generatePrice));
      setMseStocks(MSE_STOCKS.map(generatePrice));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (worldStocks.length === 0) return null;

  return (
    <div>
      {/* Олон улсын бирж */}
      <div className="bg-gray-950 text-white overflow-hidden h-8 flex items-center border-b border-gray-800">
        <div className="bg-blue-700 px-3 h-full flex items-center flex-shrink-0 z-10">
          <span className="text-[10px] font-black tracking-wider whitespace-nowrap">ДЭЛХИЙ</span>
        </div>
        <div className="animate-ticker flex whitespace-nowrap">
          {[...worldStocks, ...worldStocks].map((s, i) => (
            <span key={i} className="mx-5 text-xs inline-flex items-center gap-1.5">
              <span className="font-medium text-gray-400">{s.symbol}</span>
              <span className="text-white font-semibold">{s.price.toLocaleString()}</span>
              <span className={`font-medium ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {s.change >= 0 ? "▲" : "▼"}{Math.abs(s.change)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Монголын хөрөнгийн бирж */}
      <div className="bg-gray-900 text-white overflow-hidden h-8 flex items-center border-b border-gray-700">
        <div className="bg-red-700 px-3 h-full flex items-center flex-shrink-0 z-10">
          <span className="text-[10px] font-black tracking-wider whitespace-nowrap">MSE 🇲🇳</span>
        </div>
        <div className="animate-ticker-reverse flex whitespace-nowrap">
          {[...mseStocks, ...mseStocks].map((s, i) => (
            <span key={i} className="mx-5 text-xs inline-flex items-center gap-1.5">
              <span className="font-medium text-amber-400">{s.name}</span>
              <span className="text-gray-500 text-[10px]">({s.symbol})</span>
              <span className="text-white font-semibold">{s.price.toLocaleString()}₮</span>
              <span className={`font-medium ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {s.change >= 0 ? "▲" : "▼"}{Math.abs(s.change)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
