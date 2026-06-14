import Link from "next/link";
import { Play, Sparkles, Zap, Users, Download } from "lucide-react";
import { EXAMPLE_PROMPTS, MANHWA_STYLES } from "@/lib/constants";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-zinc-800 text-xs tracking-[2px] mb-6">
          <Sparkles className="w-3.5 h-3.5" /> POWERED BY VEO 3 • KLING • RUNWAY • PIXVERSE
        </div>

        <h1 className="manhwa-hero-title text-7xl md:text-[86px] leading-[0.92] tracking-tighter font-semibold">
          KOREAN MANHWA.<br />CINEMATIC MOTION.
        </h1>
        <p className="mt-5 text-2xl text-zinc-400 tracking-tight">6-second animated videos from a single sentence.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href="/generate" className="manhwa-btn text-lg px-9 py-3.5 rounded-2xl flex items-center justify-center gap-3">
            <Play className="w-5 h-5" /> START CREATING FREE
          </Link>
          <Link href="/login" className="manhwa-btn-secondary text-lg px-9 py-3.5 rounded-2xl flex items-center justify-center gap-2">
            Sign in with Google
          </Link>
        </div>
        <div className="text-xs text-zinc-500 mt-4">No credit card required • 3 free generations on signup</div>
      </div>

      {/* Example Prompt */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="manhwa-card p-6 rounded-3xl text-left">
          <div className="uppercase text-xs tracking-widest text-[#b91c1c] mb-2">TRY THIS PROMPT</div>
          <div className="text-2xl font-medium leading-tight text-white/90">
            “{EXAMPLE_PROMPTS[0]}”
          </div>
          <div className="mt-4 text-sm text-zinc-400">→ Auto-analyzed • Enhanced for 6 video models • Rendered in 16:9 and 9:16</div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-zinc-800 bg-[#111] py-14">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: "AI Scene Analyzer", desc: "Automatically detects characters, emotion, weather, action & camera intent." },
            { icon: Zap, title: "Prompt Enhancement", desc: "Transforms simple text into rich optimized prompts for Veo 3, Kling, Runway, PixVerse, Luma & Hailuo." },
            { icon: Play, title: "True 6s 24fps 1080p", desc: "Cinematic quality output. 16:9 and vertical 9:16 ready for shorts & Reels." },
            { icon: Users, title: "Custom LoRA Training", desc: "Upload your own manhwa panels. Train personal styles that appear in the style selector." },
          ].map((f, idx) => (
            <div key={idx} className="manhwa-card p-6 rounded-2xl">
              <f.icon className="w-6 h-6 text-[#b91c1c] mb-4" />
              <div className="font-semibold mb-1.5">{f.title}</div>
              <div className="text-sm text-zinc-400">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[#b91c1c] text-sm tracking-[1px]">SIX SIGNATURE STYLES</div>
            <div className="text-3xl font-semibold tracking-tight">Built for Korean webtoon aesthetics</div>
          </div>
          <Link href="/styles" className="text-sm hidden md:block">Train your own →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MANHWA_STYLES.map((s) => (
            <div key={s.id} className="manhwa-card p-4 rounded-2xl text-sm">
              <div className="font-semibold">{s.name}</div>
              <div className="text-zinc-400 text-xs mt-1 leading-snug">{s.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Motion + Controls highlight */}
      <div className="bg-zinc-950 py-14 border-y border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-[#b91c1c] tracking-[1.5px] text-xs mb-2">MOTION CONTROLS</div>
          <div className="text-4xl tracking-[-1.2px] font-semibold">Camera zooms. Rain physics. Emotional acting.</div>
          <p className="mt-3 text-zinc-400 max-w-md mx-auto">Every toggle you select is intelligently fused into the final prompt sent to the video model.</p>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 text-center">
        <Link href="/generate" className="manhwa-btn text-xl px-14 py-4 rounded-2xl inline-flex items-center gap-3">
          CREATE YOUR FIRST VIDEO <Play />
        </Link>
        <div className="mt-4 text-xs text-zinc-500">Instant preview using our advanced procedural renderer — real AI models available with API keys</div>
      </div>

      <footer className="border-t border-zinc-800 py-10 text-xs text-zinc-500 text-center">
        Manhwa Motion AI — Production-ready Next.js SaaS (localStorage demo) • Future-proof custom LoRA support
      </footer>
    </div>
  );
}
