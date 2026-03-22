"use client";

export default function Error({ reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-red-600">Мэдээ ачаалахад алдаа гарлаа</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Дахин оролдох
      </button>
    </div>
  );
}
