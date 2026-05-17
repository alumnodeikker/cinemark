import "./globals.css";
import Header from "@/components/layout/Header";
import { siteConfig } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Cinemark - Peliculas, trailers y favoritos",
    template: "%s | Cinemark",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["peliculas", "trailers", "cine", "actores", "favoritos"],
  authors: [{ name: "Cinemark" }],
  creator: "Cinemark",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Cinemark - Peliculas, trailers y favoritos",
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cinemark - Peliculas, trailers y favoritos",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body>
        <div className="nfx-bg min-h-screen">
          <div className="nfx-noise" />
          <div className="nfx-frame min-h-screen">
            <Header />
            <main className="nfx-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
