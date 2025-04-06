import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./leafletImport";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vehicle Tracking System",
  description:
    "A modern vehicle tracking system built with Next.js and Express",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <div className="container mx-auto px-4 py-6">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
