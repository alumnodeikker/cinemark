import { absoluteUrl } from "@/lib/seo";

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/populares"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
