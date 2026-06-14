"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PromptInput from "@/components/PromptInput";
import StyleSelector from "@/components/StyleSelector";
import MotionControls from "@/components/MotionControls";
import SceneAnalyzer from "@/components/SceneAnalyzer";
import VideoPreviewCanvas from "@/components/VideoPreviewCanvas";
import { MANHWA_STYLES, VIDEO_PROVIDERS, ASPECT_RATIOS } from "@/lib/constants";
import { analyzeScene } from "@/lib/scene-analyzer";
import { enhancePrompt } from "@/lib/prompt-enhancer";
import { generateWithProvider } from "@/lib/video-providers";
import { GeneratedVideo, SceneAnalysis, AspectRatio } from "@/lib/types";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

export default function GeneratePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(MANHWA_STYLES[0].id);
  const [selectedProvider, setSelectedProvider] = useState(VIDEO_PROVIDERS[0].id);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [motionControls, setMotionControls] = useState<string[]>(["camera-zoom-in", "effect-rain", "acting-dramatic"]);

  const [analysis, setAnalysis] = useState<SceneAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState("");

  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);

  // For real Kling videos
  const [isKlingReal, setIsKlingReal] = useState(false);
  const [realVideoUrl, setRealVideoUrl] = useState<string | null>(null);

  // Custom styles from localStorage - read live so training on /styles page appears immediately
  const customStyles = (() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("mm_custom_styles") || "[]");
    } catch {
      return [];
    }
  })();

  const currentStyle = [...MANHWA_STYLES, ...customStyles].find((s: any) => s.id === selectedStyle) || MANHWA_STYLES[0];

  // 1. Analyze Scene
  const handleAnalyze = () => {
    if (!prompt.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeScene(prompt);
      setAnalysis(result);
      setIsAnalyzing(false);
      toast.success("Scene analyzed. Ready for enhancement.");
    }, 680);
  };

  // 2. Enhance
  const handleEnhance = () => {
    if (!prompt.trim() || !analysis) {
      toast.error("Analyze the scene first");
      return;
    }
    setIsEnhancing(true);

    setTimeout(() => {
      const enhanced = enhancePrompt(prompt, selectedStyle, motionControls, analysis, selectedProvider, aspectRatio);
      setEnhancedPrompt(enhanced);
      setIsEnhancing(false);
      toast.info("Prompt optimized for the selected video model");
    }, 520);
  };

  // 3. Generate full video
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    let currentAnalysis = analysis;
    if (!currentAnalysis) {
      currentAnalysis = analyzeScene(prompt);
      setAnalysis(currentAnalysis);
    }

    const finalEnhanced = enhancedPrompt || enhancePrompt(prompt, selectedStyle, motionControls, currentAnalysis, selectedProvider, aspectRatio);
    setEnhancedPrompt(finalEnhanced);

    setIsGenerating(true);
    setGenProgress(3);
    setGenStep("Initializing...");
    setIsKlingReal(false);
    setRealVideoUrl(null);

    try {
      if (selectedProvider === "kling") {
        // === REAL KLING AI INTEGRATION ===
        setGenStep("Submitting to Kling AI...");
        setGenProgress(10);

        // Call our secure proxy
        const createRes = await fetch("/api/kling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: finalEnhanced,
            duration: "5", // Kling supports 5 or 10
            aspectRatio,
            mode: "pro",
          }),
        });

        const createData = await createRes.json();

        if (!createRes.ok || createData.error) {
          throw new Error(createData.error || "Failed to submit to Kling");
        }

        const taskId = createData.taskId;
        setGenStep("Task submitted to Kling. Polling status...");
        setGenProgress(20);

        // Poll for completion (Kling is async, can take 30s - several minutes)
        let attempts = 0;
        const maxAttempts = 60; // ~8 minutes max
        let finalVideoUrl: string | null = null;

        while (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 8000)); // poll every 8s

          const statusRes = await fetch(`/api/kling?taskId=${taskId}`);
          const statusData = await statusRes.json();

          if (statusData.status === "succeed" && statusData.videoUrl) {
            finalVideoUrl = statusData.videoUrl;
            break;
          }
          if (statusData.status === "failed") {
            throw new Error(statusData.error || "Kling generation failed");
          }

          const pct = Math.min(25 + Math.floor((attempts / maxAttempts) * 70), 95);
          setGenProgress(pct);
          setGenStep(`Kling processing... (${statusData.status || "in progress"})`);

          attempts++;
        }

        if (!finalVideoUrl) {
          throw new Error("Timed out waiting for Kling. Check your dashboard on kling.ai for the result.");
        }

        // Success - real MP4 URL from Kling
        setIsKlingReal(true);
        setRealVideoUrl(finalVideoUrl);

        const video: GeneratedVideo = {
          id: "vid_" + Date.now(),
          userId: null,
          prompt,
          enhancedPrompt: finalEnhanced,
          style: selectedStyle,
          styleName: currentStyle.name,
          aspectRatio,
          provider: "kling",
          duration: 5,
          fps: 24,
          videoUrl: finalVideoUrl, // real https MP4
          createdAt: new Date().toISOString(),
          motionControls,
          sceneAnalysis: currentAnalysis,
        };

        setGeneratedVideo(video);
        toast.success("Real video generated by Kling AI!");

        saveToLibrary(video);
        setGenProgress(100);
        setGenStep("Done!");
      } else {
        // === FALLBACK: Original procedural mock (for other providers) ===
        const result = await generateWithProvider(
          {
            prompt,
            enhancedPrompt: finalEnhanced,
            style: currentStyle,
            aspectRatio,
            motionControls,
            provider: selectedProvider,
            sceneAnalysis: currentAnalysis,
          },
          (step, pct) => {
            setGenStep(step);
            setGenProgress(pct);
          }
        );

        const video: GeneratedVideo = {
          id: "vid_" + Date.now(),
          userId: null,
          prompt,
          enhancedPrompt: finalEnhanced,
          style: selectedStyle,
          styleName: currentStyle.name,
          aspectRatio,
          provider: selectedProvider,
          duration: result.duration,
          fps: result.fps,
          videoUrl: result.videoUrl, // demo: key
          createdAt: new Date().toISOString(),
          motionControls,
          sceneAnalysis: currentAnalysis,
        };

        setGeneratedVideo(video);
        toast.success("6-second cinematic video ready (procedural preview)");

        saveToLibrary(video);
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
      console.error(e);
    } finally {
      setIsGenerating(false);
      setGenProgress(0);
      setGenStep("");
    }
  };

  function saveToLibrary(video: GeneratedVideo) {
    try {
      const key = "mm_video_library";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([video, ...existing].slice(0, 60)));
    } catch {}
  }

  const toggleMotion = (id: string) => {
    setMotionControls((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCanvasDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manhwa-${generatedVideo?.style || "video"}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Video downloaded (WebM)");
  };

  const loadIntoLibraryAndGo = () => {
    if (generatedVideo) {
      router.push("/library");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-9">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="uppercase tracking-[2px] text-xs text-[#b91c1c]">CREATE</div>
          <h1 className="text-5xl font-semibold tracking-[-1.6px]">New Video Generation</h1>
        </div>
        <div className="text-sm text-zinc-400 hidden md:block">6 seconds • 24 fps • 1080p</div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left column: Inputs */}
        <div className="lg:col-span-7 space-y-7">
          <PromptInput value={prompt} onChange={setPrompt} onAnalyze={handleAnalyze} disabled={isGenerating} />

          <div>
            <div className="text-sm font-medium text-zinc-400 mb-3">ASPECT RATIO</div>
            <div className="flex gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`px-5 py-2 text-sm rounded-xl border ${aspectRatio === ar.value ? "border-[#b91c1c] bg-[#1f1f23]" : "border-zinc-800"}`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          <StyleSelector
            selectedId={selectedStyle}
            onSelect={setSelectedStyle}
            customStyles={customStyles}
          />

          <div>
            <div className="text-sm font-medium text-zinc-400 mb-2">VIDEO MODEL</div>
            <div className="flex flex-wrap gap-2">
              {VIDEO_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`px-4 py-1.5 rounded-full text-xs border ${selectedProvider === p.id ? "border-[#b91c1c] bg-[#3f1f1f]" : "border-zinc-800"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <MotionControls selected={motionControls} onToggle={toggleMotion} />

          <SceneAnalyzer analysis={analysis} isAnalyzing={isAnalyzing} />

          {/* Enhance + Generate */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={handleEnhance}
              disabled={!prompt || isGenerating}
              className="manhwa-btn-secondary flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : null}
              ENHANCE PROMPT FOR {VIDEO_PROVIDERS.find((p) => p.id === selectedProvider)?.name}
            </button>

            <button
              onClick={handleGenerate}
              disabled={!prompt || isGenerating}
              className="manhwa-btn flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-lg disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" /> {genStep} ({genProgress}%)
                </>
              ) : (
                <>GENERATE 6s VIDEO <ArrowRight /></>
              )}
            </button>
          </div>

          {enhancedPrompt && (
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-xs font-mono leading-relaxed text-zinc-300">
              {enhancedPrompt}
            </div>
          )}
        </div>

        {/* Right: Preview / Result */}
        <div className="lg:col-span-5">
          {!generatedVideo && (
            <div className="manhwa-card rounded-3xl p-8 h-full flex items-center justify-center text-center border-dashed border-zinc-800">
              <div>
                <div className="text-6xl mb-6 opacity-30">🎞</div>
                <div className="font-medium mb-1">Your cinematic clip will appear here</div>
                <div className="text-sm text-zinc-400 max-w-[260px] mx-auto">
                  Run Analyze → Enhance → Generate. A fully playable 6-second procedural manhwa video will render instantly.
                </div>
              </div>
            </div>
          )}

          {generatedVideo && (
            <div className="space-y-4">
              {/* Real Kling MP4 or Procedural Canvas Preview */}
              {isKlingReal && realVideoUrl ? (
                <div className="video-player-container rounded-2xl overflow-hidden border border-zinc-800 bg-black">
                  <video
                    src={realVideoUrl}
                    controls
                    className="w-full"
                    style={{
                      maxHeight: generatedVideo.aspectRatio === "9:16" ? "520px" : "420px",
                      aspectRatio: generatedVideo.aspectRatio === "16:9" ? "16 / 9" : "9 / 16",
                    }}
                  />
                  <div className="bg-[#111] border-t border-zinc-800 px-4 py-3 text-xs text-center text-emerald-400">
                    REAL MP4 from Kling AI • {generatedVideo.aspectRatio} • Click download below for the original file
                  </div>
                </div>
              ) : (
                <VideoPreviewCanvas
                  prompt={generatedVideo.prompt}
                  scene={generatedVideo.sceneAnalysis}
                  styleId={generatedVideo.style}
                  styleName={generatedVideo.styleName}
                  aspectRatio={generatedVideo.aspectRatio}
                  motionControls={generatedVideo.motionControls}
                  onDownload={handleCanvasDownload}
                />
              )}

              <div className="flex gap-3">
                <button onClick={loadIntoLibraryAndGo} className="flex-1 py-3 rounded-2xl border border-zinc-700 hover:bg-zinc-900 text-sm">SAVE TO LIBRARY</button>
                <button onClick={() => { setGeneratedVideo(null); setIsKlingReal(false); setRealVideoUrl(null); }} className="flex-1 py-3 rounded-2xl border border-zinc-700 hover:bg-zinc-900 text-sm">NEW GENERATION</button>
              </div>

              <div className="text-xs text-center text-zinc-500">
                {isKlingReal 
                  ? `Real video generated by Kling AI (provider: ${generatedVideo.provider.toUpperCase()}). The link is saved for replay.`
                  : `Procedural preview. In production this would be rendered by ${generatedVideo.provider.toUpperCase()} and uploaded to cloud storage.`
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
