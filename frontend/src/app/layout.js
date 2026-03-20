import "./globals.css";
import Footer from "../components/Footer";

export const metadata = {
  title: "MEDEE.MN - Дэлхийн мэдээ, Монголоор",
  description: "Ази, Европ, Америкийн шилдэг мэдээллийн сувгуудаас цаг алдалгүй мэдээлэл хүргэнэ.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
