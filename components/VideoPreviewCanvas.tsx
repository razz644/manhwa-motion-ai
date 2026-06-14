"use client";

import React, { useEffect, useRef, useState } from "react";
import { ManhwaCanvasRenderer } from "@/lib/canvas-renderer";
import { SceneAnalysis, AspectRatio } from "@/lib/types";
import { Play, Pause, RotateCcw, Download, Loader2 } from "lucide-react";

interface Props {
  prompt: string;
  scene: SceneAnalysis;
  styleId: string;
  styleName: string;
  aspectRatio: AspectRatio;
  motionControls: string[];
  videoKey?: string; // demo key
  onDownload?: (blob: Blob) => void;
}

export default function VideoPreviewCanvas({
  prompt,
  scene,
  styleId,
  styleName,
  aspectRatio,
  motionControls,
  onDownload,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ManhwaCanvasRenderer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(6);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Initialize renderer once params change
  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous
    if (rendererRef.current) {
      rendererRef.current.destroy();
    }

    const renderer = new ManhwaCanvasRenderer(canvasRef.current, {
      prompt,
      scene,
      styleId,
      aspectRatio,
      motionControls,
      durationSec: 6,
      fps: 24,
    });

    renderer.setTimeUpdate((t) => {
      setCurrentTime(t);
    });
    renderer.setOnEnded(() => {
      setIsPlaying(false);
    });

    rendererRef.current = renderer;

    // Initial frame
    renderer.seek(0.6);

    return () => {
      renderer.destroy();
    };
  }, [prompt, scene, styleId, aspectRatio, motionControls]);

  const togglePlay = () => {
    const r = rendererRef.current;
    if (!r) return;

    if (isPlaying) {
      r.pause();
      setIsPlaying(false);
    } else {
      r.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    rendererRef.current?.seek(t);
    setCurrentTime(t);
    if (isPlaying) {
      rendererRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const reset = () => {
    rendererRef.current?.seek(0);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleExport = async () => {
    const r = rendererRef.current;
    if (!r) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await r.exportToVideo((pct) => setExportProgress(pct));
      if (onDownload) {
        onDownload(blob);
      } else {
        // Default download behavior
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `manhwa-motion-${styleId}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed", err);
      alert("Video export failed. Try again or use a different browser.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const pct = Math.round((currentTime / duration) * 100);

  return (
    <div className="video-player-container rounded-2xl overflow-hidden border border-zinc-800">
      <div className="bg-black p-2 md:p-3">
        <canvas
          ref={canvasRef}
          className="canvas-video mx-auto"
          style={{
            maxHeight: aspectRatio === "9:16" ? "520px" : "420px",
            aspectRatio: aspectRatio === "16:9" ? "16 / 9" : "9 / 16",
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-[#111] border-t border-zinc-800 px-4 py-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="manhwa-btn w-9 h-9 flex items-center justify-center rounded-full shrink-0"
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          <input
            type="range"
            min={0}
            max={duration}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="scrubber flex-1 accent-[#b91c1c]"
          />

          <div className="font-mono text-xs text-zinc-400 w-[72px] text-right tabular-nums">
            {currentTime.toFixed(1)}s / {duration}s
          </div>

          <button onClick={reset} className="p-2 text-zinc-400 hover:text-white" title="Reset">
            <RotateCcw size={17} />
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="ml-1 flex items-center gap-2 px-4 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <Loader2 className="animate-spin" size={14} /> {exportProgress}%
              </>
            ) : (
              <>
                <Download size={15} /> EXPORT WEBM
              </>
            )}
          </button>
        </div>

        <div className="text-[10px] text-center text-zinc-500 tracking-wider">
          {styleName.toUpperCase()} • {aspectRatio} • 24 FPS • 1080P RENDER • PROCEDURAL MANHWA ENGINE
        </div>
      </div>
    </div>
  );
}
