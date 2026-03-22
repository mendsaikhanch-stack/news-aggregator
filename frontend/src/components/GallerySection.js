"use client";

import { useState, useEffect } from "react";

// Монголын байгалийн зурагнууд (Unsplash)
const GALLERY_IMAGES = {
  lake: [
    "photo-1664770427537-f24e362b0c30",
    "photo-1657864793242-0452d3f9131c",
    "photo-1639851770943-f61feed82d25",
    "photo-1639851769881-97e24e4c7fe1",
    "photo-1639851770004-5be574a7aae2",
    "photo-1664770427500-5c812c9038d4",
    "photo-1680230952712-fbb378f41241",
    "photo-1607851530384-bb20bd9f330a",
    "photo-1664770427522-816a575230ec",
    "photo-1664770427501-bd19f9f6224a",
    "photo-1664770427492-4cceb8d3b8a2",
    "photo-1545837729-1a8d397b4f4f",
    "photo-1626440164113-dffaabbd0b8a",
    "photo-1626444735739-68692fc382b8",
    "photo-1556793876-bfec59348579",
  ],
  gobi: [
    "photo-1561991123-455af4470ffd",
    "photo-1571821807771-62cf66ac3f14",
    "photo-1509316785289-025f5b846b35",
    "photo-1537212429608-6b5e5449cdf8",
    "photo-1623775729385-5bafa962b028",
    "photo-1587996409575-230de4597edb",
    "photo-1614935981447-893ce3858657",
    "photo-1613297042426-58e7fa325fa4",
    "photo-1568801556940-e5b3a55fa6ea",
    "photo-1547234935-80c7145ec969",
    "photo-1587619220946-7ea28f3a4028",
    "photo-1675232154592-b9cbe39b1a2b",
    "photo-1695554067519-a6baec49284e",
  ],
  terelj: [
    "photo-1571315742781-a6140d3a8bd5",
    "photo-1603163820382-1b62940efe43",
    "photo-1664878137611-ebc92ef150dc",
    "photo-1625544294317-fb585f0c3e9a",
    "photo-1603163859687-b05cc3c0d71f",
    "photo-1510236212927-6216b550dda2",
    "photo-1603163848758-e7a4caf32e83",
    "photo-1603163792641-4ebad619082c",
    "photo-1627802223481-2958b1b3eb0d",
    "photo-1680230955180-95cc21112a6c",
    "photo-1553267870-e92627117826",
  ],
  horse: [
    "photo-1613294576846-73901118ef6d",
    "photo-1664770427564-0d02527bba37",
    "photo-1664770427715-f1de5e31d21f",
    "photo-1613297477519-8cb5c815904d",
    "photo-1680230955653-671e6ccada24",
    "photo-1680230956361-8ef2f8c1357c",
    "photo-1680230956101-f277a0244ea3",
    "photo-1680230953473-3a6981461759",
    "photo-1680230954629-bdca2e3a5e0e",
    "photo-1680230955994-01a4bb7b4b73",
    "photo-1680230955855-7e64d0b3f9ef",
    "photo-1642484080656-7f0c393c4cc2",
  ],
  valley: [
    "photo-1742205024280-02ab2ab5207a",
    "photo-1742205024727-245bb73b38e5",
    "photo-1742201408504-4233b2f451df",
    "photo-1742201408341-29204ea79380",
    "photo-1742201408476-5f7cb1586f85",
    "photo-1742205024219-1cf96ab60f75",
    "photo-1612592150792-f66811ebf8c4",
    "photo-1711124219023-8d71c0ffb712",
    "photo-1695197974691-96ab7764b112",
    "photo-1695197987059-5b32bcc3d40e",
    "photo-1695197975093-426262ad7fed",
  ],
  mountain: [
    "photo-1742201408304-d46448663e93",
    "photo-1742201408244-d2a6c0bad33d",
    "photo-1742201473141-07daabc7a327",
    "photo-1742201408253-392e3c7483a7",
    "photo-1742201848203-ebe51015209b",
    "photo-1742201408466-cb8044a2f5c7",
    "photo-1742205368206-bbdf78727ad0",
    "photo-1742205367504-464f9adb6615",
    "photo-1742205334719-3f12786cc074",
    "photo-1742201876634-94ac20075dc6",
    "photo-1742205368069-f48da9a0b838",
  ],
  ger: [
    "photo-1645017130453-901f7d4d24e7",
    "photo-1695554477492-303aacd40561",
    "photo-1695554548143-7c3d0e6510cd",
    "photo-1547448161-c56e75b54317",
    "photo-1547448271-fde9cf7d6afc",
    "photo-1695197943218-be1bb14b6894",
    "photo-1713835877802-e3f21670064b",
    "photo-1531572511297-c738beb95186",
    "photo-1566986557395-a7bd6d6b1482",
    "photo-1586873966770-a0760f27b301",
  ],
  steppe: [
    "photo-1695553920809-b16de74e1306",
    "photo-1695553895173-f0e57e7e81a1",
    "photo-1695553965109-009ef4cdd843",
    "photo-1695553982087-e2cdf79be63d",
    "photo-1695554004134-e8751c1c2e0d",
    "photo-1695553952259-ca9e649c60b3",
    "photo-1612088373230-6a018b2c35b1",
    "photo-1660462427773-6b5ef7c74600",
    "photo-1727944341646-43167dc0a314",
    "photo-1630326867210-bf4b2cdd2019",
    "photo-1548141313-fe73c960ee39",
  ],
};

const PLACES = [
  { name: "Хөвсгөл нуур", desc: "Монголын далай — дэлхийн цэнгэг усны нөөцийн 2%", cat: "lake", gradient: "from-cyan-600 via-blue-700 to-indigo-900" },
  { name: "Говь-Алтай", desc: "Хавтгай тал, элсэн манхан, тэмээний нутаг", cat: "gobi", gradient: "from-amber-500 via-orange-700 to-red-900" },
  { name: "Тэрэлж", desc: "Хадат уулс, мэлхий чулуу — Улаанбаатараас 1 цаг", cat: "terelj", gradient: "from-emerald-600 via-green-700 to-teal-900" },
  { name: "Хустайн нуруу", desc: "Тахь адууны сүрэг — дэлхийн өв", cat: "horse", gradient: "from-lime-600 via-green-700 to-emerald-900" },
  { name: "Орхоны хөндий", desc: "Чингис хааны нийслэл Хархорум — түүхт газар", cat: "valley", gradient: "from-yellow-600 via-amber-700 to-orange-900" },
  { name: "Алтай таван богд", desc: "4374м — Монголын хамгийн өндөр оргил", cat: "mountain", gradient: "from-slate-400 via-blue-800 to-indigo-950" },
  { name: "Нүүдэлчдийн нутаг", desc: "Гэр, тал нутаг — мянган жилийн соёл", cat: "ger", gradient: "from-orange-500 via-rose-700 to-pink-900" },
  { name: "Монгол тал", desc: "Хязгааргүй тал нутаг — тэнгэрийн хөх туг", cat: "steppe", gradient: "from-green-500 via-emerald-700 to-teal-900" },
];

function imgUrl(id) {
  return `https://images.unsplash.com/${id}?w=800&q=80`;
}

export default function GallerySection() {
  const [expanded, setExpanded] = useState(null);
  const [imageIndexes, setImageIndexes] = useState(() =>
    PLACES.map(() => 0)
  );

  // 4 секунд тутам зураг автоматаар солигдоно
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndexes((prev) =>
        prev.map((idx, i) => {
          const images = GALLERY_IMAGES[PLACES[i].cat];
          return (idx + 1) % images.length;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
          {PLACES.map((place, i) => {
            const images = GALLERY_IMAGES[place.cat];
            const currentIdx = imageIndexes[i];
            const nextIdx = (currentIdx + 1) % images.length;

            return (
              <div
                key={i}
                onClick={() => setExpanded(expanded === i ? null : i)}
                className={`gallery-card relative rounded-xl overflow-hidden cursor-pointer
                  ${expanded === i ? "md:col-span-2 md:row-span-2" : ""}
                `}
              >
                {/* Gradient fallback */}
                <div className={`absolute inset-0 bg-gradient-to-br ${place.gradient}`} />

                {/* Дараагийн зураг (доод давхар) */}
                <img
                  src={imgUrl(images[nextIdx])}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />

                {/* Одоогийн зураг (fade out хийнэ) */}
                <img
                  key={`${i}-${currentIdx}`}
                  src={imgUrl(images[currentIdx])}
                  alt={place.name}
                  className="absolute inset-0 w-full h-full object-cover animate-gallery-fade"
                  onError={(e) => { e.target.style.display = "none"; }}
                />

                <div
                  className={`relative ${expanded === i ? "h-72" : "h-40 md:h-44"}
                    flex flex-col justify-end p-4 transition-all duration-500`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative">
                    <h4 className="text-white font-bold text-base md:text-lg drop-shadow-lg">
                      {place.name}
                    </h4>
                    <p
                      className={`text-white/90 text-xs md:text-sm mt-0.5 transition-all duration-300 drop-shadow
                      ${expanded === i ? "opacity-100" : "opacity-0 md:opacity-80 line-clamp-1"}`}
                    >
                      {place.desc}
                    </p>
                    {/* Зургийн тоо indicator */}
                    <div className="flex gap-0.5 mt-2">
                      {images.slice(0, Math.min(images.length, 12)).map((_, j) => (
                        <div
                          key={j}
                          className={`h-0.5 rounded-full transition-all duration-300 ${
                            j === currentIdx % Math.min(images.length, 12)
                              ? "w-4 bg-white"
                              : "w-1.5 bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
