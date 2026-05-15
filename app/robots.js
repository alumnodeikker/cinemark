import { absoluteUrl, siteConfig } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/buscar", "/mis_fav", "/mis_actores"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
