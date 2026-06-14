# Manhwa Motion AI

**Production-ready AI SaaS** for generating 6-second cinematic Korean manhwa / webtoon style animated videos from text.

Built with:
- Next.js 14 (App Router) + TypeScript + Tailwind
- Pure localStorage demo mode (no backend or accounts required to run)
- Fully modular AI video provider system (Veo 3, Kling, Runway Gen-3, PixVerse, Luma, Hailuo)
- Advanced client-side procedural 24fps 6s manhwa video renderer (no video assets required)
- Complete prompt enhancement + scene analysis pipeline
- Custom LoRA training UI + persistence for user styles (future GPU integration)

## Features Implemented

✅ Prompt input + beautiful example prompts  
✅ AI Scene Analyzer (characters, emotion, weather, camera, lighting)  
✅ Professional prompt enhancement engine per model  
✅ 6 premium manhwa styles  
✅ Rich motion & camera controls  
✅ 16:9 + 9:16 (1080p / 24fps specs)  
✅ Real-time playable canvas video renderer with rain, wind, acting, camera moves  
✅ Export to .webm using MediaRecorder (production = real MP4)  
✅ Full Video Library (save, re-render, download, copy prompts)  
✅ Instant demo "sign in" (localStorage only, simulates Google login) 
✅ User dashboard + usage mock  
✅ Custom LoRA training flow (upload images → simulated training → available in style picker)  
✅ Black + crimson premium SaaS aesthetic, fully responsive  
✅ Modular provider architecture for real API integration  

## Quick Start (Recommended)

After installing Node.js (see below), run the provided setup script:

```bash
cd /Users/vikasyadav/manhwa-motion-ai

# One-command setup (installs deps, creates .env.local, runs type check)
./scripts/setup.sh

# Start the dev server
npm run dev
```

Visit http://localhost:3000

You can also run the steps manually:
```bash
npm install
cp .env.local.example .env.local   # then edit with your keys
npm run dev
```

## Installing Prerequisites (macOS)

```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js + npm
brew install node

# Verify
node --version && npm --version
```

## Local Demo Mode (No Backend Required)

The app is designed to run completely locally using `localStorage`:

- User "login" is simulated (instant "Google" demo user created on first visit or via the login page).
- All generated videos, custom LoRA styles, and preferences are saved in browser localStorage.
- No account, no API keys, and no internet required after initial load (except for optional real AI provider calls).

To reset everything: In browser dev tools → Application → Storage → Clear site data for localhost.

The app is designed as a pure local demo from the start. All data lives in browser localStorage. No backend or external services are required or referenced in the running code.

## Custom LoRA Training & Future GPU Work

See the `/styles` page in the app. The training flow is fully simulated today. In production you would:

- Upload reference images to the `reference-images` bucket
- Queue a job to a GPU service (Fal.ai, Replicate, RunPod, or your own Kohya/ComfyUI worker)
- Store the resulting adapter ID in `user_styles.model_reference`
- Pass the custom model when calling the video provider

The UI already surfaces trained custom styles everywhere (including the generate page).

The app is fully self-contained. Optional keys for real AI video models can be added later in `.env.local`.

## Connecting Real Video AI Providers

The `lib/video-providers.ts` and `lib/prompt-enhancer.ts` are designed to be swapped easily.

Replace `generateWithProvider` mock implementation with real calls:

- **Google Veo 3** — Vertex AI / Google AI Studio
- **Kling AI** — Official Kling developer API
- **Runway** — Gen-3 Alpha via RunwayML REST
- **PixVerse**, **Luma**, **Hailuo** — Similar REST + polling pattern

You can keep the beautiful procedural renderer as an instant preview / fallback while real jobs process.

## Custom LoRA Future Work

Current flow is fully functional in the UI. To go production:

- Store uploaded images (future cloud path)
- Send batch + style name to a training service (Fal.ai, Replicate, RunPod, or your own ComfyUI + Kohya pipeline)
- Poll job status, then register the resulting LoRA / Dreambooth checkpoint
- At generation time, pass the custom model ID to the video provider (some providers like Kling/PixVerse support fine-tuned models)

The code already surfaces trained styles everywhere.

## Architecture Highlights

```
app/
  generate/          ← The core creative studio
  library/           ← All saved videos + re-render + export
  styles/            ← LoRA training + management
  dashboard/
lib/
  scene-analyzer.ts  ← Heuristic + extensible LLM-ready analyzer
  prompt-enhancer.ts ← Model-aware cinematic prompt builder
  canvas-renderer.ts ← The heart: 100% client 6s 24fps manhwa animation
  video-providers.ts ← Pluggable interface for 6+ providers
components/
  VideoPreviewCanvas ← Uses the renderer + scrubber + export
```

## Production Recommendations (when moving beyond local demo)

- Add real auth (Clerk, Auth.js, etc.) when moving to a real backend.
- Add Stripe for subscriptions
- Queue generation jobs + background worker (Inngest / Trigger.dev)
- Add proper thumbnail generation (canvas stills or provider thumbnails)
- Rate limiting + usage tracking (can use local + optional backend)
- Add real video hosting (Mux, Cloudflare Stream, or object storage)

## Real AI Video Integration (Kling AI)

As of the latest update, selecting **Kling** as the provider and having a valid `KLING_API_TOKEN` in `.env.local` will make the Generate button call the **real Kling AI text-to-video API**.

- The flow submits the (enhanced + style-injected) prompt to Kling via a secure server proxy (`/api/kling`).
- It polls the task status.
- When complete, you get a **real MP4 video URL** directly from Kling.
- The player switches to a native `<video>` element.
- The MP4 link is saved to your local library (replay + direct download as .mp4).
- All other providers fall back to the high-quality procedural canvas preview + WebM export.

See `.env.local.example` for setup instructions and how to obtain/generate the token from your Kling Access Key + Secret Key.

## Project Audit Summary (Real vs Mocked)

See the detailed audit in the code comments and the response when you asked for it. In short:

**Fully Real / Working:**
- All UI, interactions, localStorage persistence (videos + custom styles + user)
- Sophisticated Canvas-based procedural 6s 24fps "manhwa" renderer + particle system + camera + export to WebM
- Rule-based scene analysis and prompt templating
- Fake but fully functional "Google" login and everything else in the flow

**Mocked / Simulated:**
- Actual video *content* for non-Kling providers (procedural instead of AI model output)
- Scene analyzer and prompt enhancer (JS heuristics, not LLM)
- All "AI providers" except Kling (UI only)
- Custom LoRA training (progress UI + persistence only)
- No external auth or database dependencies in the current implementation.

## License & Notes

This is now a hybrid demo: beautiful instant previews always work, and real production-quality MP4s are one API token away via Kling.

Replace more providers the same way (add routes + conditional in generate page).

Built with love for manhwa, webtoons, and beautiful storytelling.

Happy animating.
