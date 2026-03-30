import "./globals.css";
import Footer from "../components/Footer";
import Analytics from "../components/Analytics";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata = {
  title: {
    default: "GEREGNEWS.MN - Дэлхийн мэдээ, Монголоор",
    template: "%s | GEREGNEWS.MN",
  },
  description: "Ази, Европ, Америкийн шилдэг мэдээллийн сувгуудаас цаг алдалгүй мэдээлэл хүргэнэ.",
  manifest: "/manifest.json",
  themeColor: "#1d4ed8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GEREGNEWS.MN",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: "GEREGNEWS.MN",
    title: "GEREGNEWS.MN - Дэлхийн мэдээ, Монголоор",
    description: "Ази, Европ, Америкийн шилдэг мэдээллийн сувгуудаас цаг алдалгүй мэдээлэл хүргэнэ.",
  },
  twitter: {
    card: "summary",
    title: "GEREGNEWS.MN",
    description: "Ази, Европ, Америкийн шилдэг мэдээллийн сувгуудаас цаг алдалгүй мэдээлэл хүргэнэ.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="alternate" type="application/rss+xml" title="GEREGNEWS.MN RSS" href="/api/rss" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <Analytics />
            <div className="flex-1">{children}</div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator){navigator.serviceWorker.register("/sw.js")}`,
          }}
        />
      </body>
    </html>
  );
}
