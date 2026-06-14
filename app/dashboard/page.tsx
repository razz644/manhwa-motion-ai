"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GeneratedVideo } from "@/lib/types";

export default function Dashboard() {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [userEmail, setUserEmail] = useState("demo@manhwamotion.ai");

  useEffect(() => {
    // Simulate user + fetch library
    try {
      const lib = JSON.parse(localStorage.getItem("mm_video_library") || "[]");
      setVideos(lib.slice(0, 6));
    } catch {}
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-[#b91c1c] text-xs tracking-[2px]">ACCOUNT</div>
          <h1 className="text-5xl tracking-[-1.4px] font-semibold">Dashboard</h1>
        </div>
        <div className="text-right">
          <div className="text-sm">{userEmail}</div>
          <div className="text-xs text-emerald-400">PRO PLAN • 47 videos this month</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-9">
        {[
          { label: "Videos Generated", value: videos.length || 14 },
          { label: "Credits Remaining", value: "187" },
          { label: "Custom Styles", value: "2" },
          { label: "Avg. Watch Time", value: "4.8s" },
        ].map((s, i) => (
          <div key={i} className="manhwa-card p-5 rounded-2xl">
            <div className="text-xs text-zinc-500">{s.label}</div>
            <div className="text-4xl font-semibold mt-1 tracking-tighter">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">Recent Videos</div>
        <Link href="/library" className="text-sm text-[#b91c1c]">View full library →</Link>
      </div>

      {videos.length === 0 && (
        <div className="manhwa-card p-10 rounded-3xl text-center text-sm text-zinc-400">
          No videos yet. <Link href="/generate" className="text-white underline">Create your first one.</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {videos.map((v) => (
          <Link key={v.id} href="/library" className="manhwa-card p-4 rounded-2xl hover:border-[#b91c1c]">
            <div className="text-sm line-clamp-2">{v.prompt}</div>
            <div className="mt-4 flex justify-between text-xs text-zinc-500">
              <span>{v.styleName}</span>
              <span>{new Date(v.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <Link href="/generate" className="manhwa-btn inline-block px-8 py-3 rounded-2xl">Generate New Video</Link>
      </div>
    </div>
  );
}
