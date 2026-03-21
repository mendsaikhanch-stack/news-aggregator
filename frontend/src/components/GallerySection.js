"use client";

import { useState } from "react";

const PLACES = [
  {
    name: "Хөвсгөл нуур",
    desc: "Монголын далай — дэлхийн цэнгэг усны нөөцийн 2%",
    gradient: "from-cyan-600 via-blue-700 to-indigo-900",
    pattern: "radial-gradient(ellipse at 30% 80%, rgba(255,255,255,0.15) 0%, transparent 60%)",
  },
  {
    name: "Говь-Алтай",
    desc: "Хавтгай тал, элсэн манхан, тэмээний нутаг",
    gradient: "from-amber-500 via-orange-700 to-red-900",
    pattern: "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    name: "Тэрэлж",
    desc: "Хадат уулс, мэлхий чулуу — Улаанбаатараас 1 цаг",
    gradient: "from-emerald-600 via-green-700 to-teal-900",
    pattern: "radial-gradient(ellipse at 50% 70%, rgba(255,255,255,0.12) 0%, transparent 55%)",
  },
  {
    name: "Хустайн нуруу",
    desc: "Тахь адууны сүрэг — дэлхийн өв",
    gradient: "from-lime-600 via-green-700 to-emerald-900",
    pattern: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    name: "Орхоны хөндий",
    desc: "Чингис хааны нийслэл Хархорум — түүхт газар",
    gradient: "from-yellow-600 via-amber-700 to-orange-900",
    pattern: "radial-gradient(ellipse at 60% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    name: "Алтай таван богд",
    desc: "4374м — Монголын хамгийн өндөр оргил",
    gradient: "from-slate-400 via-blue-800 to-indigo-950",
    pattern: "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 60%)",
  },
  {
    name: "Хөгнө Хан уул",
    desc: "Элс, ой, нуур — гурвын хослол",
    gradient: "from-orange-500 via-rose-700 to-pink-900",
    pattern: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    name: "Цагаан суварга",
    desc: "30 сая жилийн түүхтэй байгалийн гайхамшиг",
    gradient: "from-red-500 via-orange-700 to-amber-900",
    pattern: "radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
];

export default function GallerySection() {
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="py-10 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-amber-500 rounded-full" />
          <div>
            <h2 className="text-2xl font-black text-white">Галерей</h2>
            <p className="text-gray-400 text-sm">
              Монголын байгалийн үзэсгэлэнт газрууд
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLACES.map((place, i) => (
            <div
              key={i}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className={`gallery-card relative bg-gradient-to-br ${place.gradient} rounded-xl overflow-hidden cursor-pointer
                ${expanded === i ? "md:col-span-2 md:row-span-2" : ""}
              `}
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{ background: place.pattern }}
              />
              <div
                className={`relative ${expanded === i ? "h-72" : "h-40 md:h-44"}
                  flex flex-col justify-end p-4 transition-all duration-500`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative">
                  <h4 className="text-white font-bold text-base md:text-lg drop-shadow">
                    {place.name}
                  </h4>
                  <p
                    className={`text-white/80 text-xs md:text-sm mt-0.5 transition-all duration-300
                    ${expanded === i ? "opacity-100" : "opacity-0 md:opacity-70 line-clamp-1"}`}
                  >
                    {place.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
