import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Manhwa Motion AI — 6-Second Cinematic Korean Manhwa Videos",
  description: "Turn text prompts into beautiful 6-second Korean manhwa style animated videos. Powered by Veo 3, Kling, Runway, PixVerse & more. Premium AI video generation.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-zinc-200 antialiased">
        <Navbar />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

