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

function generatePrice(item) {
  const now = new Date();
  const seed = now.getHours() * 60 + now.getMinutes();
  const variance = (Math.sin(seed * 0.1 + item.symbol.length) * 0.5 +
                    Math.cos(seed * 0.05 + item.symbol.charCodeAt(0)) * 0.3);
  const changePct = Number((variance * 1.5).toFixed(2));
  const price = Number((item.base * (1 + changePct / 100)).toFixed(item.base < 10 ? 4 : 2));
  return { ...item, price, change: changePct };
}

export default function StockTicker() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const all = [...INDICES, ...CURRENCIES, ...COMMODITIES];
    setStocks(all.map(generatePrice));
    const interval = setInterval(() => {
      setStocks(all.map(generatePrice));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (stocks.length === 0) return null;

  return (
    <div className="bg-gray-950 text-white overflow-hidden h-8 flex items-center border-b border-gray-800">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...stocks, ...stocks].map((s, i) => (
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
  );
}
