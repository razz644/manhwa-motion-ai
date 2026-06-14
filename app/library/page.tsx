"use client";

import React, { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import VideoPreviewCanvas from "@/components/VideoPreviewCanvas";
import { GeneratedVideo } from "@/lib/types";
import { toast } from "sonner";

export default function LibraryPage() {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<GeneratedVideo | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  function loadVideos() {
    try {
      const saved = JSON.parse(localStorage.getItem("mm_video_library") || "[]");
      setVideos(saved);
    } catch {
      setVideos([]);
    }
  }

  const handlePlay = (v: GeneratedVideo) => {
    setActiveVideo(v);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    const filtered = videos.filter((v) => v.id !== id);
    setVideos(filtered);
    localStorage.setItem("mm_video_library", JSON.stringify(filtered));
    if (activeVideo?.id === id) setActiveVideo(null);
    toast.info("Video removed from library");
  };

  const handleDownload = async (v: GeneratedVideo) => {
    // For demo we re-render using the canvas renderer by temporarily showing it
    // In real prod this would download the MP4 from cloud storage.
    toast.loading("Preparing video for download...");
    setActiveVideo(v);

    setTimeout(() => {
      // Trigger the canvas export if the preview component is mounted
      const downloadBtn = document.querySelector('[title="EXPORT WEBM"]') as HTMLButtonElement;
      if (downloadBtn) downloadBtn.click();
      else toast.success("Download started from preview");
    }, 650);
  };

  const copyAllPrompts = () => {
    const all = videos.map((v) => v.enhancedPrompt).join("\n\n---\n\n");
    navigator.clipboard.writeText(all);
    toast.success("All enhanced prompts copied");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-9">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-[#b91c1c] text-xs tracking-widest">YOUR WORK</div>
          <h1 className="text-5xl font-semibold tracking-[-1.5px]">Video Library</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <button onClick={copyAllPrompts} className="manhwa-btn-secondary px-5 py-2 rounded-xl">Copy All Prompts</button>
          <a href="/generate" className="manhwa-btn px-5 py-2 rounded-xl">New Video</a>
        </div>
      </div>

      {activeVideo && (
        <div className="mb-9">
          {activeVideo.videoUrl.startsWith("http") ? (
            // Real MP4 from Kling or other provider
            <div className="video-player-container rounded-2xl overflow-hidden border border-zinc-800 bg-black">
              <video
                src={activeVideo.videoUrl}
                controls
                className="w-full"
                style={{
                  maxHeight: activeVideo.aspectRatio === "9:16" ? "520px" : "420px",
                  aspectRatio: activeVideo.aspectRatio === "16:9" ? "16 / 9" : "9 / 16",
                }}
              />
              <div className="bg-[#111] border-t border-zinc-800 px-4 py-3 text-xs text-center text-emerald-400">
                REAL MP4 • {activeVideo.aspectRatio} • Provider: {activeVideo.provider.toUpperCase()}
              </div>
            </div>
          ) : (
            <VideoPreviewCanvas
              prompt={activeVideo.prompt}
              scene={activeVideo.sceneAnalysis}
              styleId={activeVideo.style}
              styleName={activeVideo.styleName}
              aspectRatio={activeVideo.aspectRatio}
              motionControls={activeVideo.motionControls}
              onDownload={(blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `manhwa-${activeVideo.id}.webm`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success("Video exported");
              }}
            />
          )}
          <div className="text-center mt-3 flex gap-4 justify-center">
            {activeVideo.videoUrl.startsWith("http") && (
              <a
                href={activeVideo.videoUrl}
                download={`manhwa-${activeVideo.id}.mp4`}
                className="text-xs bg-emerald-900 hover:bg-emerald-800 px-3 py-1 rounded text-white"
              >
                DOWNLOAD ORIGINAL MP4
              </a>
            )}
            <button onClick={() => setActiveVideo(null)} className="text-xs text-zinc-400 hover:text-white">CLOSE PREVIEW</button>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="manhwa-card p-14 rounded-3xl text-center">
          Your generated videos will appear here.<br />
          <a href="/generate" className="text-[#b91c1c] underline">Generate your first video</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={handlePlay}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      <div className="mt-10 text-xs text-zinc-500 max-w-sm">
        Videos are stored locally in your browser (localStorage). For cross-device persistence and real MP4 hosting, you would connect a backend.
      </div>
    </div>
  );
}
