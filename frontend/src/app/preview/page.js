"use client";

import { useState } from "react";

const devices = [
  { id: "iphone15", name: "iPhone 15 Pro", w: 393, h: 852, os: "ios", radius: 50 },
  { id: "iphone_se", name: "iPhone SE", w: 375, h: 667, os: "ios", radius: 30 },
  { id: "pixel8", name: "Pixel 8", w: 412, h: 915, os: "android", radius: 40 },
  { id: "galaxy_s24", name: "Galaxy S24", w: 360, h: 780, os: "android", radius: 35 },
  { id: "ipad", name: "iPad Air", w: 820, h: 1180, os: "ios", radius: 20 },
];

export default function PreviewPage() {
  const [activeDevices, setActiveDevices] = useState(["iphone15", "pixel8"]);
  const [url, setUrl] = useState("/");
  const [scale, setScale] = useState(0.55);

  const pages = [
    { label: "Нүүр", path: "/" },
    { label: "Спорт", path: "/?category=sports" },
    { label: "Технологи", path: "/?category=tech" },
    { label: "Демо", path: "/demo" },
    { label: "Админ", path: "/admin" },
  ];

  const toggleDevice = (id) => {
    setActiveDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">MEDEE.MN Device Preview</h1>
            <p className="text-gray-400 text-sm">
              Android & iOS загварууд
            </p>
          </div>
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Сайт руу буцах
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Device selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-2">Төхөөрөмж:</span>
            {devices.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDevice(d.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeDevices.includes(d.id)
                    ? d.os === "ios"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {d.os === "ios" ? "\uF8FF " : "\u{1F4F1} "}
                {d.name}
              </button>
            ))}
          </div>

          {/* Page selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-2">Хуудас:</span>
            {pages.map((p) => (
              <button
                key={p.path}
                onClick={() => setUrl(p.path)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  url === p.path
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Scale */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Хэмжээ:</span>
            {[0.4, 0.55, 0.7, 0.85, 1].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-2 py-1 rounded text-xs ${
                  scale === s
                    ? "bg-gray-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device frames */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex gap-8 justify-center flex-wrap items-start">
          {devices
            .filter((d) => activeDevices.includes(d.id))
            .map((device) => (
              <div key={device.id} className="flex flex-col items-center gap-3">
                {/* Device label */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      device.os === "ios" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-300">
                    {device.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {device.w}x{device.h}
                  </span>
                </div>

                {/* Phone frame */}
                <div
                  className="relative bg-gray-900 shadow-2xl shadow-black/50"
                  style={{
                    width: device.w * scale + 24,
                    height: device.h * scale + 24,
                    borderRadius: device.radius * scale + 8,
                    padding: 12,
                    border: "3px solid #374151",
                  }}
                >
                  {/* Notch (iOS) */}
                  {device.os === "ios" && device.id !== "ipad" && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 z-10"
                      style={{
                        width: 120 * scale,
                        height: 28 * scale,
                        borderRadius: `0 0 ${16 * scale}px ${16 * scale}px`,
                      }}
                    />
                  )}

                  {/* Status bar indicator */}
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center justify-between z-10 pointer-events-none"
                    style={{ width: device.w * scale - 20 }}
                  >
                    <span
                      className="text-white font-semibold"
                      style={{ fontSize: 10 * scale }}
                    >
                      {device.os === "ios" ? "9:41" : "9:41"}
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className="bg-white rounded-sm"
                        style={{
                          width: 14 * scale,
                          height: 8 * scale,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>

                  {/* Screen */}
                  <iframe
                    src={url}
                    className="bg-white"
                    style={{
                      width: device.w,
                      height: device.h,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      borderRadius: device.radius,
                      border: "none",
                    }}
                    title={device.name}
                  />

                  {/* Home indicator (iOS) */}
                  {device.os === "ios" && device.id !== "ipad" && (
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-500 rounded-full"
                      style={{
                        width: 100 * scale,
                        height: 4 * scale,
                      }}
                    />
                  )}

                  {/* Android nav bar */}
                  {device.os === "android" && (
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4"
                      style={{ width: device.w * scale * 0.5 }}
                    >
                      <div
                        className="bg-gray-500 rounded-sm"
                        style={{ width: 10 * scale, height: 10 * scale }}
                      />
                      <div
                        className="bg-gray-500 rounded-full"
                        style={{ width: 12 * scale, height: 12 * scale }}
                      />
                      <div
                        className="bg-gray-500"
                        style={{
                          width: 10 * scale,
                          height: 10 * scale,
                          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
