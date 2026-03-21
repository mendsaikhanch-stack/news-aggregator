import "./globals.css";
import Footer from "../components/Footer";
import Analytics from "../components/Analytics";

export const metadata = {
  title: "MEDEE.MN - Дэлхийн мэдээ, Монголоор",
  description: "Ази, Европ, Америкийн шилдэг мэдээллийн сувгуудаас цаг алдалгүй мэдээлэл хүргэнэ.",
  manifest: "/manifest.json",
  themeColor: "#1d4ed8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MEDEE.MN",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Analytics />
        <div className="flex-1">{children}</div>
        <Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator){navigator.serviceWorker.register("/sw.js")}`,
          }}
        />
      </body>
    </html>
  );
}
