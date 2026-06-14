import { ManhwaStyle, MotionControl, VideoProvider } from "./types";

export const MANHWA_STYLES: ManhwaStyle[] = [
  {
    id: "korean-webtoon",
    name: "Korean Webtoon",
    description: "Classic Naver Webtoon clean lines, vibrant emotion",
    promptSuffix: "in classic Korean webtoon art style, clean bold ink lines, expressive eyes, dramatic panel composition, subtle halftone shading",
  },
  {
    id: "solo-leveling",
    name: "Solo Leveling",
    description: "Dark fantasy, razor sharp shadows, intense action",
    promptSuffix: "Solo Leveling manhwa style, high contrast black and crimson, ultra detailed linework, menacing aura, cinematic shadows, powerful dynamic poses",
  },
  {
    id: "romance-manhwa",
    name: "Romance Manhwa",
    description: "Soft pastels, beautiful emotions, dreamy atmosphere",
    promptSuffix: "beautiful Korean romance manhwa style, soft lighting, delicate line art, emotional close-ups, cherry blossom accents, heartwarming yet melancholic mood",
  },
  {
    id: "school-drama",
    name: "School Drama",
    description: "Youthful, emotional high-school settings, rain & corridors",
    promptSuffix: "Korean high school manhwa drama style, rainy school windows, uniform details, emotional expressions, soft bokeh backgrounds, introspective mood",
  },
  {
    id: "dark-thriller",
    name: "Dark Thriller",
    description: "Psychological, heavy atmosphere, neo-noir",
    promptSuffix: "dark psychological thriller manhwa, gritty urban tones, deep shadows, suspenseful framing, red accent highlights, tense body language",
  },
  {
    id: "fantasy-action",
    name: "Fantasy Action",
    description: "Epic battles, magic, mythical Korean-inspired",
    promptSuffix: "epic fantasy action manhwa, dynamic sword fighting, glowing runes, dramatic sky, detailed armor and fabric, powerful motion blur and speed lines",
  },
];

export const MOTION_CONTROLS: MotionControl[] = [
  { id: "camera-zoom-in", label: "Slow Camera Zoom In", category: "camera" },
  { id: "camera-tracking", label: "Tracking Shot", category: "camera" },
  { id: "camera-orbit", label: "Orbit Camera", category: "camera" },
  { id: "camera-dutch", label: "Dutch Angle", category: "camera" },
  { id: "effect-rain", label: "Rain / Drizzle", category: "effect" },
  { id: "effect-heavy-rain", label: "Heavy Rain", category: "effect" },
  { id: "effect-wind", label: "Wind / Hair Movement", category: "effect" },
  { id: "effect-speedlines", label: "Speed Lines & Impact", category: "effect" },
  { id: "effect-lensflare", label: "Cinematic Lens Flare", category: "effect" },
  { id: "acting-subtle", label: "Subtle Emotional Acting", category: "acting" },
  { id: "acting-dramatic", label: "Dramatic Performance", category: "acting" },
  { id: "acting-intense", label: "Intense Expressive Acting", category: "acting" },
];

export const VIDEO_PROVIDERS: VideoProvider[] = [
  { id: "veo3", name: "Google Veo 3", description: "Highest cinematic quality" },
  { id: "kling", name: "Kling AI 1.6", description: "Excellent motion & physics" },
  { id: "runway", name: "Runway Gen-3 Alpha", description: "Premium filmic look" },
  { id: "pixverse", name: "PixVerse v4", description: "Fast, great character consistency" },
  { id: "luma", name: "Luma Dream Machine", description: "Creative & dreamlike motion" },
  { id: "hailuo", name: "Hailuo MiniMax", description: "Strong prompt adherence" },
];

export const DEFAULT_STYLE = MANHWA_STYLES[0];
export const DEFAULT_PROVIDER = VIDEO_PROVIDERS[0];

export const EXAMPLE_PROMPTS = [
  "A lonely girl standing in rain outside a school, emotional Korean manhwa style",
  "Young swordsman awakening his power in an abandoned temple at dusk, Solo Leveling style",
  "Couple sharing an umbrella under cherry blossoms, soft romance manhwa",
  "Protagonist walking through dark rainy Seoul alley, intense expression, thriller manhwa",
  "Mage girl summoning a dragon spirit in ancient ruins, epic fantasy action",
];

export const ASPECT_RATIOS: { value: "16:9" | "9:16"; label: string; width: number; height: number }[] = [
  { value: "16:9", label: "Landscape (16:9)", width: 1280, height: 720 },
  { value: "9:16", label: "Portrait / Shorts (9:16)", width: 720, height: 1280 },
];
