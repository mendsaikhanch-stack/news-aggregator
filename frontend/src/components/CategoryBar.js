"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  { label: "Бүгд", value: "" },
  { label: "Дэлхий", value: "world" },
  { label: "Технологи", value: "tech" },
  { label: "Бизнес", value: "business" },
  { label: "Спорт", value: "sports" },
  { label: "Шинжлэх ухаан", value: "science" },
  { label: "Эрүүл мэнд", value: "health" },
  { label: "Улс төр", value: "politics" },
  { label: "Соёл урлаг", value: "entertainment" },
];

export default function CategoryBar() {
  const searchParams = useSearchParams();
  const current = searchParams.get("category") || "";

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={cat.value ? `/?category=${cat.value}` : "/"}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                current === cat.value
                  ? "bg-blue-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
