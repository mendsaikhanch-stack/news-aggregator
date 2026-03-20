import "./globals.css";

export const metadata = {
  title: "News Aggregator - Мэдээний Агрегатор",
  description: "AI-р ажилладаг мэдээний агрегатор",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
