import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartButton from "@/components/CartButton";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechStore - Componentes y Computadoras",
  description: "Tu tienda especializada en componentes de computación y computadoras armadas. Encuentra los mejores productos para armar tu PC ideal.",
  keywords: "computadoras, componentes, PC, hardware, procesadores, tarjetas gráficas, memoria RAM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartButton />
        </ClientProviders>
      </body>
    </html>
  );
}
