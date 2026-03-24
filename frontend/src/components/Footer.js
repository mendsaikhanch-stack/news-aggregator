export default function Footer() {
  const year = new Date().getFullYear();

  const mnSources = [
    { name: "iKon.mn", url: "https://ikon.mn", color: "text-blue-400" },
    { name: "News.mn", url: "https://news.mn", color: "text-green-400" },
    { name: "Montsame", url: "https://montsame.mn", color: "text-red-400" },
    { name: "24tsag.mn", url: "https://www.24tsag.mn", color: "text-yellow-400" },
    { name: "Shuud.mn", url: "https://shuud.mn", color: "text-purple-400" },
    { name: "GoGo.mn", url: "https://gogo.mn", color: "text-orange-400" },
    { name: "Eagle News", url: "https://youtube.com/@eaglenews", color: "text-red-400" },
    { name: "MNB", url: "https://mnb.mn", color: "text-blue-400" },
    { name: "TV9", url: "https://youtube.com/@tv9mongolia", color: "text-cyan-400" },
  ];

  const intlSources = [
    { name: "BBC News", url: "https://bbc.com/news", color: "text-red-400" },
    { name: "NY Times", url: "https://nytimes.com", color: "text-gray-300" },
    { name: "The Guardian", url: "https://theguardian.com", color: "text-blue-300" },
    { name: "Al Jazeera", url: "https://aljazeera.com", color: "text-amber-400" },
    { name: "DW", url: "https://dw.com", color: "text-blue-400" },
    { name: "France 24", url: "https://france24.com", color: "text-blue-300" },
    { name: "CNA", url: "https://channelnewsasia.com", color: "text-red-400" },
    { name: "Yonhap", url: "https://en.yna.co.kr", color: "text-blue-400" },
    { name: "SCMP", url: "https://scmp.com", color: "text-yellow-400" },
    { name: "Euronews", url: "https://euronews.com", color: "text-blue-300" },
    { name: "TASS", url: "https://tass.com", color: "text-red-300" },
    { name: "Japan Times", url: "https://japantimes.co.jp", color: "text-red-400" },
    { name: "Korea Times", url: "https://koreatimes.co.kr", color: "text-blue-400" },
    { name: "Times of India", url: "https://timesofindia.indiatimes.com", color: "text-orange-400" },
    { name: "Arab News", url: "https://arabnews.com", color: "text-green-400" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Брэнд */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-white mb-2">GEREGNEWS.MN</h3>
          <p className="text-sm">Дэлхийн мэдээ — Нэг дороос, Монголоор</p>
        </div>

        {/* Монгол эх сурвалжууд */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Монгол эх сурвалж
          </h4>
          <div className="flex flex-wrap gap-2">
            {mnSources.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${s.color} bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors`}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        {/* Олон улсын эх сурвалжууд */}
        <div className="mb-8">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Олон улсын эх сурвалж
          </h4>
          <div className="flex flex-wrap gap-2">
            {intlSources.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${s.color} bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors`}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        {/* Холбоосууд */}
        <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
          <a href="/" className="hover:text-white transition-colors">Нүүр</a>
          <a href="/api/rss" target="_blank" className="hover:text-white transition-colors">RSS Feed</a>
          <a href="/admin" className="hover:text-white transition-colors">Админ</a>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>&copy; {year} GEREGNEWS.MN. Бүх эрх хуулиар хамгаалагдсан.</p>
          <p className="mt-2 md:mt-0">
            {mnSources.length + intlSources.length}+ эх сурвалж &middot; 5 бүс нутаг &middot; AI орчуулга
          </p>
        </div>
      </div>
    </footer>
  );
}
