"use client";

import { SceneAnalysis, AspectRatio } from "./types";

// Highly customized Canvas-based 6-second 24fps Manhwa-style video renderer.
// Draws stylized black/red/white Korean webtoon aesthetic.
// Supports rain, wind, camera moves, acting, different styles via params.
// Fully self-contained — no external video files required.

export interface RenderOptions {
  prompt: string;
  scene: SceneAnalysis;
  styleId: string;
  aspectRatio: AspectRatio;
  motionControls: string[];
  durationSec?: number;
  fps?: number;
}

export class ManhwaCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: RenderOptions;
  private raf: number | null = null;
  private startTime = 0;
  private isPlaying = false;
  private currentTime = 0;
  private onTimeUpdate?: (t: number) => void;
  private onEnded?: () => void;

  private width: number;
  private height: number;

  // Particle system
  private raindrops: Array<{ x: number; y: number; speed: number; len: number }> = [];
  private windParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

  constructor(canvas: HTMLCanvasElement, options: RenderOptions) {
    this.canvas = canvas;
    this.options = options;

    const aspect = options.aspectRatio === "16:9" ? 16 / 9 : 9 / 16;
    // Fixed internal resolution (1080p-ish scaled)
    this.width = options.aspectRatio === "16:9" ? 1280 : 720;
    this.height = Math.round(this.width / aspect);

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;

    this.initParticles();
  }

  private initParticles() {
    this.raindrops = [];
    this.windParticles = [];

    const rainIntensity = this.options.motionControls.includes("effect-heavy-rain")
      ? 220
      : this.options.motionControls.includes("effect-rain")
      ? 110
      : 0;

    for (let i = 0; i < rainIntensity; i++) {
      this.raindrops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 380 + Math.random() * 220,
        len: 12 + Math.random() * 18,
      });
    }

    const wind = this.options.motionControls.includes("effect-wind");
    for (let i = 0; i < (wind ? 38 : 12); i++) {
      this.windParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.9,
        vx: (wind ? 1.6 : 0.4) + Math.random() * 1.4,
        vy: wind ? -0.6 + Math.random() * 0.3 : 0.1,
        life: 60 + Math.random() * 80,
      });
    }
  }

  public setTimeUpdate(cb: (t: number) => void) {
    this.onTimeUpdate = cb;
  }

  public setOnEnded(cb: () => void) {
    this.onEnded = cb;
  }

  public play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = performance.now() - this.currentTime * 1000;
    this.loop();
  }

  public pause() {
    this.isPlaying = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  public seek(timeSec: number) {
    const dur = this.options.durationSec ?? 6;
    this.currentTime = Math.max(0, Math.min(timeSec, dur));
    this.drawFrame(this.currentTime);
    this.onTimeUpdate?.(this.currentTime);
  }

  public getCurrentTime() {
    return this.currentTime;
  }

  public getDuration() {
    return this.options.durationSec ?? 6;
  }

  public destroy() {
    this.pause();
  }

  private loop = () => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;
    const dur = this.options.durationSec ?? 6;

    let t = elapsed % dur;
    if (elapsed >= dur && !this.options.motionControls.includes("effect-heavy-rain")) {
      // Loop only rain scenes, otherwise stop once
      t = dur;
      this.currentTime = dur;
      this.drawFrame(t);
      this.onTimeUpdate?.(t);
      this.pause();
      this.onEnded?.();
      return;
    }

    this.currentTime = t;
    this.drawFrame(t);
    this.onTimeUpdate?.(t);

    this.raf = requestAnimationFrame(this.loop);
  };

  // ============== DRAWING ENGINE ==============
  private drawFrame(t: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const { scene, styleId, motionControls, aspectRatio } = this.options;

    // Background base - deep dark with red undertone
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    // Environment gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.9);
    if (scene.environment.includes("school") || scene.environment.includes("class")) {
      grad.addColorStop(0, "#111113");
      grad.addColorStop(1, "#1c1c20");
    } else if (scene.environment.includes("ruins") || scene.environment.includes("temple")) {
      grad.addColorStop(0, "#0f0e0d");
      grad.addColorStop(1, "#181614");
    } else {
      grad.addColorStop(0, "#0c0c0f");
      grad.addColorStop(1, "#151517");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Style specific accents
    if (styleId === "solo-leveling" || styleId === "dark-thriller") {
      ctx.fillStyle = "rgba(120, 15, 15, 0.07)";
      ctx.fillRect(0, 0, w, h);
    }

    // Draw environment / background elements
    this.drawEnvironment(ctx, w, h, scene, t);

    // Camera transform simulation (zoom, tracking, orbit)
    ctx.save();
    let camX = 0, camY = 0, camScale = 1;

    const isZoom = motionControls.includes("camera-zoom-in");
    const isTrack = motionControls.includes("camera-tracking");
    const isOrbit = motionControls.includes("camera-orbit");
    const dutch = motionControls.includes("camera-dutch");

    if (isZoom) {
      camScale = 1 + (t / 6) * 0.18; // slow push in
      camX = (w * 0.04) * (t / 6);
    }
    if (isTrack) {
      camX = Math.sin(t * 0.6) * 28;
    }
    if (isOrbit) {
      const angle = (t / 6) * 1.8;
      camX = Math.cos(angle) * 38;
      camY = Math.sin(angle * 0.6) * 16;
    }
    if (dutch) {
      ctx.translate(w / 2, h / 2);
      ctx.rotate(((Math.sin(t * 1.2) * 1.5) * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
    }

    ctx.translate(w / 2 + camX, h / 2 + camY);
    ctx.scale(camScale, camScale);
    ctx.translate(-w / 2, -h / 2);

    // Main character(s)
    const characterCount = Math.min(scene.characters.length, 2);
    const isAction = scene.action.includes("fight") || scene.action.includes("sword") || motionControls.includes("effect-speedlines");

    for (let i = 0; i < characterCount; i++) {
      const offsetX = (i - (characterCount - 1) / 2) * (w * 0.26);
      this.drawManhwaCharacter(ctx, w / 2 + offsetX, h * 0.58, t, scene, styleId, isAction, i);
    }

    ctx.restore();

    // Rain & wind particles (drawn on top of camera for impact)
    const hasRain = motionControls.some((c) => c.includes("rain"));
    if (hasRain) this.drawRain(ctx, w, h, t);

    const hasWind = motionControls.includes("effect-wind");
    if (hasWind) this.drawWind(ctx, w, h, t);

    // Subtle vignette + film grain
    this.drawVignette(ctx, w, h);
    if (Math.random() > 0.6) this.drawFilmGrain(ctx, w, h);

    // Very subtle red accent bar at bottom like old manhwa print
    ctx.fillStyle = "rgba(185, 28, 28, 0.35)";
    ctx.fillRect(0, h - 3, w, 3);

    // Optional speech / thought bubble if emotional scene
    if (scene.emotions.some((e) => ["melancholy", "sorrow", "longing"].includes(e))) {
      this.drawSpeechBubble(ctx, w * 0.78, h * 0.22, "...", t);
    }
  }

  private drawEnvironment(ctx: CanvasRenderingContext2D, w: number, h: number, scene: SceneAnalysis, t: number) {
    const env = scene.environment.toLowerCase();

    // Floor / ground plane
    ctx.fillStyle = "#121214";
    ctx.fillRect(0, h * 0.66, w, h * 0.4);

    // Horizon line / architecture hints
    ctx.strokeStyle = "#2a2a2e";
    ctx.lineWidth = 2.5;

    if (env.includes("school") || env.includes("courtyard")) {
      // School building silhouette + windows
      ctx.fillStyle = "#1a1a1e";
      ctx.fillRect(w * 0.08, h * 0.22, w * 0.84, h * 0.46);

      // Windows grid (manhwa style)
      ctx.strokeStyle = "#3a3a40";
      ctx.lineWidth = 1.5;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 7; col++) {
          const wx = w * 0.14 + col * (w * 0.105);
          const wy = h * 0.29 + row * (h * 0.11);
          ctx.strokeRect(wx, wy, w * 0.068, h * 0.065);
          // Occasional lit window
          if ((col + row) % 3 === 0) {
            ctx.fillStyle = "rgba(200, 180, 120, 0.15)";
            ctx.fillRect(wx + 1, wy + 1, w * 0.066, h * 0.063);
          }
        }
      }
      // Fence / railing
      ctx.strokeStyle = "#333";
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.63);
      ctx.lineTo(w * 0.9, h * 0.63);
      ctx.stroke();
    } else if (env.includes("temple") || env.includes("ruins")) {
      ctx.fillStyle = "#161512";
      ctx.fillRect(w * 0.05, h * 0.18, w * 0.9, h * 0.5);
      // Pillars
      ctx.fillStyle = "#222";
      for (let i = 0; i < 5; i++) {
        const px = w * 0.15 + i * (w * 0.16);
        ctx.fillRect(px, h * 0.21, w * 0.045, h * 0.48);
      }
    } else {
      // Generic dramatic city / landscape
      ctx.fillStyle = "#151517";
      ctx.fillRect(w * 0.02, h * 0.29, w * 0.96, h * 0.42);
      // Distant buildings
      ctx.fillStyle = "#1f1f22";
      for (let i = 0; i < 9; i++) {
        const bw = 38 + ((i % 3) * 19);
        ctx.fillRect(w * 0.06 + i * 118, h * 0.32 + (i % 2) * 22, bw, h * 0.37);
      }
    }

    // Ground details / puddle reflections if rainy
    if (scene.weather.includes("rain")) {
      ctx.fillStyle = "rgba(40,40,46,0.6)";
      ctx.fillRect(0, h * 0.71, w, h * 0.29);
      ctx.fillStyle = "rgba(80, 90, 110, 0.25)";
      ctx.fillRect(w * 0.1, h * 0.79, w * 0.3, 11);
      ctx.fillRect(w * 0.55, h * 0.83, w * 0.35, 9);
    }
  }

  private drawManhwaCharacter(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    t: number,
    scene: SceneAnalysis,
    styleId: string,
    isAction: boolean,
    index: number
  ) {
    const s = 1.0; // scale
    const headY = cy - 82 * s;
    const isSolo = styleId === "solo-leveling" || styleId === "fantasy-action" || styleId === "dark-thriller";

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 54, 42 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body / coat or school uniform
    ctx.fillStyle = isSolo ? "#111" : "#1f1f23";
    ctx.strokeStyle = "#e5e5e7";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 23 * s, cy - 12);
    ctx.lineTo(cx - 34 * s, cy + 52 * s);
    ctx.lineTo(cx + 34 * s, cy + 52 * s);
    ctx.lineTo(cx + 23 * s, cy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jacket / uniform lapels
    ctx.strokeStyle = isSolo ? "#b91c1c" : "#4a4a50";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 5);
    ctx.lineTo(cx - 4, cy + 46);
    ctx.moveTo(cx + 12, cy - 5);
    ctx.lineTo(cx + 4, cy + 46);
    ctx.stroke();

    // Arms
    const leftArmAngle = isAction ? Math.sin(t * 4.5) * 0.9 - 0.3 : -0.9 + Math.sin(t * 1.6) * 0.12;
    const rightArmAngle = isAction ? Math.sin(t * 4.5 + 1.1) * -0.9 + 0.2 : 0.9 + Math.cos(t * 1.8) * 0.15;

    ctx.strokeStyle = "#e5e5e7";
    ctx.lineWidth = 5.5;
    // left arm
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy + 6);
    ctx.lineTo(cx - 17 + Math.cos(leftArmAngle) * 39, cy + 6 + Math.sin(leftArmAngle) * 39);
    ctx.stroke();
    // right arm
    ctx.beginPath();
    ctx.moveTo(cx + 17, cy + 6);
    ctx.lineTo(cx + 17 + Math.cos(rightArmAngle) * 39, cy + 6 + Math.sin(rightArmAngle) * 39);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#f1e9df";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(cx, headY, 18.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair - different per style
    ctx.fillStyle = isSolo ? "#0a0a0a" : "#1c1a18";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.arc(cx - 1, headY - 3, 19.5 * s, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();

    // Fringe
    ctx.beginPath();
    ctx.moveTo(cx - 17, headY - 5);
    ctx.quadraticCurveTo(cx - 3, headY - 21, cx + 16, headY - 4);
    ctx.stroke();

    // Eyes - extremely important for manhwa emotion
    const emotion = scene.emotions[0] || "quiet intensity";
    let eyeOffsetY = 0;
    let eyeSquint = 0;

    if (emotion.includes("melancholy") || emotion.includes("sorrow")) {
      eyeOffsetY = 1.5;
      eyeSquint = 2.5;
    } else if (emotion.includes("joy")) {
      eyeSquint = -1.5;
    } else if (emotion.includes("rage") || emotion.includes("intensity") || isAction) {
      eyeOffsetY = -1;
    }

    // Left eye
    ctx.fillStyle = "#0e0e0e";
    ctx.fillRect(cx - 11, headY - 1 + eyeOffsetY, 7, 3.2 - eyeSquint);
    ctx.fillRect(cx + 4, headY - 1 + eyeOffsetY, 7, 3.2 - eyeSquint);

    // Highlights (classic manhwa sparkle)
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - 9.5, headY - 0.6 + eyeOffsetY, 2.2, 1);
    ctx.fillRect(cx + 5.5, headY - 0.6 + eyeOffsetY, 2.2, 1);

    // Mouth
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    if (emotion.includes("sorrow") || emotion.includes("melancholy")) {
      ctx.arc(cx, headY + 8, 4.5, 0.2, Math.PI - 0.2);
    } else {
      ctx.moveTo(cx - 4, headY + 8);
      ctx.lineTo(cx + 4, headY + 8);
    }
    ctx.stroke();

    // If action / sword
    if (isAction && index === 0) {
      ctx.strokeStyle = "#c9c9cf";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 32, cy - 18);
      ctx.lineTo(cx + 69 + Math.sin(t * 5.5) * 4, cy - 57 + Math.cos(t * 3) * 6);
      ctx.stroke();

      // Blade shine
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 38, cy - 23);
      ctx.lineTo(cx + 64, cy - 49);
      ctx.stroke();
    }
  }

  private drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    ctx.strokeStyle = "rgba(200,210,225,0.65)";
    ctx.lineWidth = 1.1;

    for (const drop of this.raindrops) {
      const x = (drop.x + Math.sin(t * 1.6 + drop.x) * 1.6) % w;
      const y = (drop.y + (t * drop.speed * 1.8) % (h * 1.6)) % (h + 60) - 40;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.8, y + drop.len);
      ctx.stroke();

      // splash on ground
      if (y > h * 0.71 && Math.random() > 0.7) {
        ctx.fillStyle = "rgba(180,195,215,0.35)";
        ctx.beginPath();
        ctx.arc(x + 1.5, h * 0.735, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawWind(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    ctx.strokeStyle = "rgba(215, 215, 225, 0.38)";
    ctx.lineWidth = 1;

    for (let i = 0; i < this.windParticles.length; i++) {
      const p = this.windParticles[i];
      p.x = (p.x + p.vx * (1 + Math.sin(t * 2.2 + i) * 0.3)) % (w + 60);
      p.y = ((p.y + p.vy) % (h * 0.85)) + 20;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 16 - Math.sin(t + i) * 5, p.y + 2);
      ctx.stroke();
    }
  }

  private drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.72)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  private drawFilmGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = "rgba(255,255,255,0.028)";
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
  }

  private drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, t: number) {
    ctx.save();
    const bob = Math.sin(t * 1.8) * 2.5;
    ctx.translate(0, bob);

    ctx.strokeStyle = "#e5e5e7";
    ctx.fillStyle = "#0f0f11";
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.ellipse(x, y, 42, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // tail
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 17);
    ctx.lineTo(x - 22, y + 39);
    ctx.lineTo(x + 8, y + 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c8c8ce";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + 4);
    ctx.restore();
  }

  // Public render single frame (for thumbnails)
  public renderThumbnail() {
    this.drawFrame(1.8);
    return this.canvas.toDataURL("image/jpeg", 0.86);
  }

  // Export current animation to video using MediaRecorder (WebM)
  // Made robust to prevent runtime errors on browsers that don't support vp9 or webm perfectly.
  public async exportToVideo(onProgress?: (pct: number) => void): Promise<Blob> {
    const stream = this.canvas.captureStream(24);

    let recorder: MediaRecorder;
    try {
      // Prefer vp9, fallback to default (works on more browsers including some Safari via polyfill or webm)
      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
    } catch {
      try {
        recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      } catch {
        recorder = new MediaRecorder(stream); // last resort - browser default
      }
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(blob);
      };
      recorder.onerror = (e) => reject(e);

      this.seek(0);
      recorder.start();

      const dur = this.getDuration();
      let frame = 0;
      const totalFrames = Math.floor(dur * 24);

      const step = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }
        this.seek((frame / 24));
        onProgress?.(Math.round((frame / totalFrames) * 100));
        frame++;
        setTimeout(step, 1000 / 24);
      };
      step();
    });
  }
}
