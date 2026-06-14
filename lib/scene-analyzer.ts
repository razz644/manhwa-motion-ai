import { SceneAnalysis } from "./types";

// Sophisticated rule-based + keyword-driven scene analyzer
// In production: replace with LLM call (OpenAI / Grok / Claude) for higher accuracy.
const EMOTION_KEYWORDS: Record<string, string> = {
  lonely: "melancholy", sad: "sadness", cry: "sorrow", crying: "sorrow", tears: "sorrow",
  happy: "joy", smile: "joy", laughing: "joy", excited: "excitement",
  angry: "rage", furious: "rage", intense: "intensity",
  scared: "fear", terrified: "terror", shocked: "shock",
  love: "love", romantic: "longing", tender: "tenderness",
  determined: "resolve", serious: "gravity", cold: "detachment",
  emotional: "deep emotion", powerful: "power", mysterious: "mystery",
};

const WEATHER_KEYWORDS: Record<string, string> = {
  rain: "rainy", rainy: "rainy", pouring: "heavy rain", drizzle: "light rain",
  storm: "stormy", snow: "snowy", wind: "windy",
  sunny: "sunny", clear: "clear sky", cloudy: "overcast", fog: "foggy", mist: "misty",
};

const ENV_KEYWORDS: Record<string, string> = {
  school: "high school courtyard / corridor", classroom: "classroom", "school gate": "school gate",
  rain: "rain-soaked street", street: "city street", alley: "dark alley",
  temple: "ancient temple", ruins: "forgotten ruins", forest: "enchanted forest",
  rooftop: "rooftop at night", "seoul": "Seoul cityscape", window: "through a window",
  room: "dimly lit interior", battlefield: "epic battlefield", castle: "fantasy castle",
};

const ACTION_KEYWORDS: Record<string, string> = {
  standing: "standing still in thought", walking: "walking slowly", running: "running desperately",
  "looking out": "gazing into distance", staring: "intense stare",
  fight: "fighting", sword: "wielding a sword", summon: "summoning power",
  crying: "crying alone", hug: "embracing", kiss: "tender moment",
  awakening: "power awakening", falling: "falling / collapsing", jump: "leaping",
};

const CHARACTER_KEYWORDS = ["girl", "boy", "man", "woman", "swordsman", "mage", "student", "protagonist", "hero", "couple", "warrior", "princess", "king"];

const CAMERA_SUGGESTIONS = [
  "slow dramatic push-in", "wide establishing then close-up", "side tracking shot", 
  "low angle heroic", "high angle lonely", "orbiting 180 around subject", "static with subtle handheld"
];

export function analyzeScene(prompt: string): SceneAnalysis {
  const lower = prompt.toLowerCase();

  // Characters
  const characters: string[] = [];
  CHARACTER_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw)) characters.push(kw);
  });
  if (characters.length === 0) characters.push("lone protagonist");

  // Emotions
  const emotions: string[] = [];
  Object.keys(EMOTION_KEYWORDS).forEach((kw) => {
    if (lower.includes(kw)) emotions.push(EMOTION_KEYWORDS[kw]);
  });
  if (emotions.length === 0) emotions.push("quiet intensity");

  // Environment
  let environment = "dramatic Korean urban or natural landscape";
  for (const [kw, env] of Object.entries(ENV_KEYWORDS)) {
    if (lower.includes(kw)) {
      environment = env;
      break;
    }
  }

  // Weather
  let weather = "clear dramatic sky";
  for (const [kw, w] of Object.entries(WEATHER_KEYWORDS)) {
    if (lower.includes(kw)) {
      weather = w;
      break;
    }
  }

  // Action
  let action = "standing with powerful presence";
  for (const [kw, act] of Object.entries(ACTION_KEYWORDS)) {
    if (lower.includes(kw)) {
      action = act;
      break;
    }
  }
  if (lower.includes("rain")) action += " in the rain";

  // Camera
  let cameraMovement = CAMERA_SUGGESTIONS[Math.floor(Math.random() * CAMERA_SUGGESTIONS.length)];
  if (lower.includes("rain") || lower.includes("alone")) cameraMovement = "slow emotional push-in from wide";
  if (lower.includes("fight") || lower.includes("sword") || lower.includes("action")) cameraMovement = "dynamic tracking + slight orbit";

  // Lighting
  let lighting = "moody cinematic volumetric lighting";
  if (weather.includes("rain")) lighting = "wet reflective surfaces with cold rim light";
  if (environment.includes("school") || environment.includes("class")) lighting = "soft window light mixed with cool fluorescent";

  // Extract key visual terms
  const keywords = prompt
    .split(/[\s,]+/)
    .filter((w) => w.length > 3)
    .slice(0, 8);

  return {
    characters: Array.from(new Set(characters)),
    emotions: Array.from(new Set(emotions)),
    environment,
    action,
    weather,
    cameraMovement,
    lighting,
    keywords,
  };
}
