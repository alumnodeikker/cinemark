import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavLateral from "@/components/NavLateral";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cinemark - Streaming de Peliculas",
  description: "Descubre peliculas, mira trailers y guarda tus favoritas.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <div className="nfx-bg min-h-screen">
          <div className="nfx-noise" />
          <div className="nfx-frame min-h-screen">
            <NavLateral />
            <main className="nfx-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
