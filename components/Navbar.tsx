"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, LogOut, Play } from "lucide-react";
import { useDemoUser, signOut } from "@/lib/auth";

export default function Navbar() {
  const { user } = useDemoUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem("mm_demo_user");
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      window.location.href = "/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-[#b91c1c] flex items-center justify-center">
              <Play className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="font-semibold tracking-tighter text-xl">Manhwa Motion AI</div>
              <div className="text-[10px] text-zinc-500 -mt-1">CINEMATIC KOREAN ANIMATION</div>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/generate" className="hover:text-white text-zinc-400 transition">Generate</Link>
          <Link href="/library" className="hover:text-white text-zinc-400 transition">Library</Link>
          <Link href="/styles" className="hover:text-white text-zinc-400 transition">My Styles</Link>
          <Link href="/pricing" className="hover:text-white text-zinc-400 transition">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
                <User className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-1.5 text-sm rounded-full border border-zinc-700 hover:bg-zinc-900 transition"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="manhwa-btn px-5 py-1.5 text-sm rounded-full flex items-center gap-2"
            >
              Sign in with Google
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0a0a0a] px-6 py-4 flex flex-col gap-3 text-sm">
          <Link href="/generate" className="py-1">Generate</Link>
          <Link href="/library" className="py-1">Library</Link>
          <Link href="/styles" className="py-1">My Styles</Link>
          <Link href="/pricing" className="py-1">Pricing</Link>
          <Link href="/dashboard" className="py-1">Dashboard</Link>
          {!user && (
            <Link href="/login" className="mt-1 manhwa-btn px-5 py-2 text-center rounded-full">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
