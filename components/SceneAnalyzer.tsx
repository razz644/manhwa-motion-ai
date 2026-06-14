"use client";

import { SceneAnalysis } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  analysis: SceneAnalysis | null;
  isAnalyzing?: boolean;
}

export default function SceneAnalyzer({ analysis, isAnalyzing }: Props) {
  if (isAnalyzing) {
    return (
      <div className="manhwa-card p-5 rounded-2xl">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <div className="animate-spin h-3.5 w-3.5 border border-[#b91c1c] border-t-transparent rounded-full" />
          AI Scene Analyzer running...
        </div>
        <div className="mt-3 text-xs text-zinc-500">Detecting characters, emotion, lighting, camera language...</div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="manhwa-card p-5 rounded-2xl"
    >
      <div className="uppercase tracking-[1.5px] text-[10px] font-medium text-[#b91c1c] mb-3">AI SCENE ANALYSIS</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
        <div>
          <div className="text-zinc-500 text-xs mb-1">CHARACTERS</div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.characters.map((c, i) => <span key={i} className="analysis-chip">{c}</span>)}
          </div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs mb-1">EMOTIONS</div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.emotions.map((e, i) => <span key={i} className="analysis-chip">{e}</span>)}
          </div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs mb-1">ENVIRONMENT</div>
          <div>{analysis.environment}</div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs mb-1">ACTION</div>
          <div>{analysis.action}</div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs mb-1">WEATHER &amp; ATMOSPHERE</div>
          <div>{analysis.weather}</div>
        </div>

        <div>
          <div className="text-zinc-500 text-xs mb-1">CAMERA LANGUAGE</div>
          <div>{analysis.cameraMovement}</div>
        </div>

        <div className="md:col-span-2">
          <div className="text-zinc-500 text-xs mb-1">LIGHTING</div>
          <div>{analysis.lighting}</div>
        </div>
      </div>

      <div className="text-[10px] text-zinc-600 mt-4">Analysis used to craft hyper-specific cinematic prompts for all supported models.</div>
    </motion.div>
  );
}
