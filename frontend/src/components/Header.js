"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo + Нэр */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-2xl font-black text-blue-700">N</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              NEWS AGGREGATOR
            </h1>
            <p className="text-[10px] text-blue-200 tracking-widest uppercase">
              Мэдээний Агрегатор
            </p>
          </div>
        </Link>

        {/* Навигаци */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-blue-100 hover:text-white transition-colors font-medium"
          >
            Нүүр
          </Link>
        </nav>
      </div>
    </header>
  );
}
