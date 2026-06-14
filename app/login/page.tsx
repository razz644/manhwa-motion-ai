"use client";

import { signInWithGoogle } from "@/lib/auth";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      alert("Google sign-in failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-9">
          <div className="text-[#b91c1c] text-xs tracking-[3px] mb-3">MANHWA MOTION AI</div>
          <h1 className="text-4xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-zinc-400 mt-2">Sign in to generate, save, and train your own styles.</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="manhwa-btn w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg disabled:opacity-70"
        >
          {loading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <div className="text-xs text-center mt-8 text-zinc-500">
          By continuing you agree to our Terms &amp; Privacy.<br />
          This is a local demo — your session lives in browser localStorage only.
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
