export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Брэнд */}
          <div>
            <h3 className="text-xl font-black text-white mb-2">MEDEE.MN</h3>
            <p className="text-sm leading-relaxed">
              Дэлхийн мэдээ — Нэг дороос, Монголоор.
              Ази, Европ, Америкийн шилдэг мэдээллийн сувгуудаас
              цаг алдалгүй мэдээлэл хүргэнэ.
            </p>
          </div>

          {/* Эх сурвалжууд */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Эх сурвалжууд
            </h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span>BBC News</span>
              <span>Al Jazeera</span>
              <span>NY Times</span>
              <span>France 24</span>
              <span>DW</span>
              <span>Euronews</span>
              <span>CNA</span>
              <span>SCMP</span>
              <span>Yonhap</span>
              <span>TASS</span>
              <span>iKon.mn</span>
              <span>MNB</span>
            </div>
          </div>

          {/* Холбоосууд */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Холбоосууд
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/" className="hover:text-white transition-colors">
                Нүүр хуудас
              </a>
              <a href="/admin" className="hover:text-white transition-colors">
                Админ
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>&copy; {year} MEDEE.MN. Бүх эрх хуулиар хамгаалагдсан.</p>
          <p className="mt-2 md:mt-0">
            18 эх сурвалж &middot; 4 бүс нутаг &middot; AI орчуулга
          </p>
        </div>
      </div>
    </footer>
  );
}
