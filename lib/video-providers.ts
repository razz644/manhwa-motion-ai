import { GeneratedVideo, GenerationParams } from "./types";
import { analyzeScene } from "./scene-analyzer";
import { enhancePrompt } from "./prompt-enhancer";

// Modular provider system. 
// Each provider can be swapped for real API integration.
export interface VideoGenerationResult {
  videoUrl: string; // demo:xxx or https://...
  thumbnailUrl?: string;
  duration: number;
  fps: number;
}

export async function generateWithProvider(
  params: GenerationParams,
  onProgress?: (step: string, pct: number) => void
): Promise<VideoGenerationResult> {
  onProgress?.("Contacting " + params.provider + "...", 5);

  // Simulate network + processing time (realistic for video AI: 10-40s)
  await delay(1200);

  onProgress?.("Optimizing prompt for model...", 22);
  await delay(900);

  onProgress?.("Generating keyframes and motion vectors...", 45);
  await delay(1600);

  onProgress?.("Rendering 6-second 24fps animation...", 68);
  await delay(2200);

  onProgress?.("Applying cinematic color grade & film effects...", 88);
  await delay(1100);

  // Kling is now handled with a *real* integration via /api/kling (see app/generate/page.tsx and app/api/kling/route.ts).
  // Other providers remain mocked (procedural canvas preview).
  // When provider === 'kling' the generate page bypasses this mock and calls the real Kling proxy.

  // For non-Kling: return a deterministic demo key used by the canvas renderer
  const demoKey = createDemoKey(params);

  onProgress?.("Finalizing and delivering...", 98);
  await delay(600);

  return {
    videoUrl: `demo:${demoKey}`,
    duration: 6,
    fps: 24,
  };
}

function createDemoKey(params: GenerationParams): string {
  const styleSlug = params.style.id;
  const hasRain = params.motionControls.some((c) => c.includes("rain"));
  const hasAction = params.motionControls.some((c) => c.includes("speed") || params.sceneAnalysis.action.includes("fight") || params.sceneAnalysis.action.includes("sword"));
  const emotion = params.sceneAnalysis.emotions[0]?.replace(/\s+/g, "-") || "emotional";

  return `${styleSlug}-${params.aspectRatio.replace(":", "x")}-${hasRain ? "rain" : "clear"}-${hasAction ? "action" : "drama"}-${emotion}`.toLowerCase();
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Mock real provider call examples (for future implementation)
export async function callRealVeo3(prompt: string, aspect: string) {
  // Example pseudocode
  // const res = await fetch("https://api.veo.google.com/...", { method:"POST", body: JSON.stringify({prompt, aspectRatio: aspect}) })
  throw new Error("Real Veo 3 integration not configured. Add VEO3_API_KEY and implement call.");
}

// Similar for others...
