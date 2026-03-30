export default function robots() {
  const siteUrl = process.env.SITE_URL || "https://geregnews.mn";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
