import { GenerationParams, SceneAnalysis } from "./types";
import { MANHWA_STYLES } from "./constants";

// Converts user prompt + analysis + controls into highly optimized prompts
// for different video generators. Each provider gets slightly different emphasis.
export function enhancePrompt(
  userPrompt: string,
  styleId: string,
  motionControls: string[],
  sceneAnalysis: SceneAnalysis,
  providerId: string,
  aspectRatio: "16:9" | "9:16"
): string {
  const style = MANHWA_STYLES.find((s) => s.id === styleId) || MANHWA_STYLES[0];

  const motionPhrases: string[] = [];
  if (motionControls.includes("camera-zoom-in")) motionPhrases.push("slow cinematic camera push-in");
  if (motionControls.includes("camera-tracking")) motionPhrases.push("smooth lateral tracking shot");
  if (motionControls.includes("camera-orbit")) motionPhrases.push("gentle 180-degree orbiting camera");
  if (motionControls.includes("camera-dutch")) motionPhrases.push("dutch angle camera tilt building tension");

  if (motionControls.includes("effect-rain") || motionControls.includes("effect-heavy-rain")) {
    motionPhrases.push("photorealistic rain droplets falling, wet surfaces, reflections");
  }
  if (motionControls.includes("effect-wind")) motionPhrases.push("strong wind moving hair and clothing fabric");
  if (motionControls.includes("effect-speedlines")) motionPhrases.push("dramatic Korean webtoon speed lines and impact frames");
  if (motionControls.includes("effect-lensflare")) motionPhrases.push("beautiful anamorphic lens flares and light streaks");

  let acting = "subtle nuanced emotional performance";
  if (motionControls.includes("acting-dramatic")) acting = "highly expressive dramatic acting with strong eye acting";
  if (motionControls.includes("acting-intense")) acting = "intense powerful emotional acting, trembling, powerful gaze";

  const base = `${userPrompt.trim()}. ${style.promptSuffix}`;

  // Scene details
  const details = [
    `Scene: ${sceneAnalysis.characters.join(", ")}`,
    `Action: ${sceneAnalysis.action}`,
    `Environment: ${sceneAnalysis.environment}`,
    `Weather & atmosphere: ${sceneAnalysis.weather}`,
    `Emotion: ${sceneAnalysis.emotions.join(", ")}`,
    `Lighting: ${sceneAnalysis.lighting}`,
    `Camera: ${sceneAnalysis.cameraMovement}`,
  ].join(". ");

  const motionStr = motionPhrases.length > 0 ? `Motion & camera: ${motionPhrases.join(", ")}. ${acting}.` : acting + ".";

  const common = [
    "highly detailed Korean manhwa / webtoon animation style",
    "cinematic 6-second video clip, 24fps, 1080p",
    "dramatic composition, professional color grading, film grain, beautiful inking",
    "sharp line art, expressive faces, dynamic storytelling",
    aspectRatio === "9:16" ? "vertical composition optimized for mobile shorts" : "widescreen cinematic aspect ratio",
  ].join(", ");

  // Provider-specific tuning
  let providerTuning = "";
  switch (providerId) {
    case "veo3":
      providerTuning = "photorealistic illustration rendered as smooth animation, exceptional motion coherence, Veo 3 quality, intricate details";
      break;
    case "kling":
      providerTuning = "Kling AI native high motion fidelity, physically accurate fabric and water, natural timing";
      break;
    case "runway":
      providerTuning = "Runway Gen-3 filmic look, gorgeous cinematic color, premium storytelling frames";
      break;
    case "pixverse":
      providerTuning = "PixVerse v4 strong subject consistency, vibrant color, clean stylized animation";
      break;
    case "luma":
      providerTuning = "Luma Dream Machine artistic and slightly surreal motion, beautiful dreamlike quality";
      break;
    case "hailuo":
    default:
      providerTuning = "Hailuo excellent prompt following, natural motion, strong character presence";
  }

  const fullPrompt = [
    base,
    details,
    motionStr,
    common,
    providerTuning,
    "masterpiece, best quality, 6 seconds duration exactly, no text on screen unless speech bubble is part of story",
  ].join(". ");

  return fullPrompt;
}
