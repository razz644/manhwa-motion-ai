"use client";

import React from "react";
import { GeneratedVideo } from "@/lib/types";
import { Download, Copy, Trash2, Play } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  video: GeneratedVideo;
  onPlay: (video: GeneratedVideo) => void;
  onDelete?: (id: string) => void;
  onDownload?: (video: GeneratedVideo) => void;
}

export default function VideoCard({ video, onPlay, onDelete, onDownload }: Props) {
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(video.enhancedPrompt);
    alert("Enhanced prompt copied to clipboard");
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="manhwa-card rounded-2xl overflow-hidden flex flex-col">
      <div
        onClick={() => onPlay(video)}
        className="relative aspect-video bg-black flex items-center justify-center cursor-pointer group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 z-10" />
        <div className="z-20 flex items-center gap-2 text-white/90 group-hover:text-white">
          <div className="bg-white/10 rounded-full p-3">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-sm">PLAY 6s CLIP</div>
            <div className="text-[10px] text-white/60 -mt-0.5">{video.aspectRatio} • {video.provider.toUpperCase()}</div>
          </div>
        </div>

        <div className="absolute top-2 right-2 text-[10px] bg-black/70 text-white px-2 py-px rounded z-20">
          {video.styleName}
        </div>
        {video.videoUrl.startsWith("http") && (
          <div className="absolute top-2 left-2 text-[10px] bg-emerald-900/90 text-emerald-300 px-2 py-px rounded z-20">
            REAL
          </div>
        )}
      </div>

      <div className="p-3.5 text-sm flex-1 flex flex-col">
        <div className="line-clamp-2 text-zinc-200 text-[13px] leading-snug flex-1">{video.prompt}</div>

        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div>{new Date(video.createdAt).toLocaleDateString()}</div>
          <div className="flex items-center gap-2">
            <button onClick={copyPrompt} title="Copy enhanced prompt" className="hover:text-white p-1">
              <Copy size={15} />
            </button>
            {video.videoUrl.startsWith("http") ? (
              <a
                href={video.videoUrl}
                download={`manhwa-${video.id}.mp4`}
                title="Download original MP4"
                className="hover:text-white p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={15} />
              </a>
            ) : (
              <button
                onClick={() => onDownload && onDownload(video)}
                title="Download"
                className="hover:text-white p-1"
              >
                <Download size={15} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(video.id)} title="Delete" className="hover:text-red-400 p-1">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
