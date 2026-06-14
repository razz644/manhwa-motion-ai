export type AspectRatio = "16:9" | "9:16";

export type ManhwaStyle = {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
};

export type MotionControl = {
  id: string;
  label: string;
  category: "camera" | "effect" | "acting";
};

export type SceneAnalysis = {
  characters: string[];
  emotions: string[];
  environment: string;
  action: string;
  weather: string;
  cameraMovement: string;
  lighting: string;
  keywords: string[];
};

export type GenerationParams = {
  prompt: string;
  enhancedPrompt: string;
  style: ManhwaStyle;
  aspectRatio: AspectRatio;
  motionControls: string[];
  provider: string;
  sceneAnalysis: SceneAnalysis;
};

export type GeneratedVideo = {
  id: string;
  userId: string | null;
  prompt: string;
  enhancedPrompt: string;
  style: string;
  styleName: string;
  aspectRatio: AspectRatio;
  provider: string;
  duration: number;
  fps: number;
  videoUrl: string; // "demo:<key>" or real https
  thumbnailUrl?: string;
  createdAt: string;
  motionControls: string[];
  sceneAnalysis: SceneAnalysis;
  // For custom LoRA
  customStyleId?: string | null;
};

export type UserCustomStyle = {
  id: string;
  userId: string;
  name: string;
  description: string;
  imageCount: number;
  status: "training" | "ready" | "failed";
  trainedAt: string | null;
  createdAt: string;
};

export type VideoProvider = {
  id: string;
  name: string;
  description: string;
};
