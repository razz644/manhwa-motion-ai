"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { UserCustomStyle } from "@/lib/types";

export default function CustomStylesPage() {
  const [images, setImages] = useState<File[]>([]);
  const [styleName, setStyleName] = useState("My Personal Manhwa Style");
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainedStyles, setTrainedStyles] = useState<UserCustomStyle[]>([]);

  // Load previously "trained" custom styles
  React.useEffect(() => {
    const saved = localStorage.getItem("mm_custom_styles");
    if (saved) setTrainedStyles(JSON.parse(saved));
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [...prev, ...arr].slice(0, 12));
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const startTraining = async () => {
    if (images.length < 4) {
      toast.error("Please upload at least 4 reference manhwa images for good results");
      return;
    }
    setIsTraining(true);
    setProgress(0);

    // Simulate realistic multi-stage LoRA fine-tuning
    const stages = [
      "Uploading images to secure training cluster...",
      "Preprocessing & captioning panels (OCR + LLM)...",
      "Extracting style embeddings (linework, shading, color)...",
      "Training LoRA adapter — epoch 12 / 40",
      "Training LoRA adapter — epoch 29 / 40",
      "Optimizing for video motion coherence...",
      "Registering custom model in your account...",
    ];

    for (let i = 0; i < stages.length; i++) {
      setProgress(Math.round(((i + 1) / stages.length) * 100));
      toast.info(stages[i]);
      await new Promise((r) => setTimeout(r, 1350 + Math.random() * 700));
    }

    const newStyle: UserCustomStyle = {
      id: "custom_" + Date.now(),
      userId: "demo-user",
      name: styleName,
      description: `Custom style trained on ${images.length} reference images`,
      imageCount: images.length,
      status: "ready",
      trainedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...trainedStyles, newStyle];
    setTrainedStyles(updated);
    localStorage.setItem("mm_custom_styles", JSON.stringify(updated));

    setIsTraining(false);
    setImages([]);
    setProgress(0);

    toast.success(`"${styleName}" is now available in the style selector!`, { duration: 6000 });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="text-[#b91c1c] text-xs tracking-[2px]">FUTURE-PROOF FEATURE</div>
        <h1 className="text-5xl font-semibold tracking-[-1.6px]">Train Custom LoRA Styles</h1>
        <p className="text-xl text-zinc-400 mt-2">Upload your own manhwa panels. Create personal animation styles that feel uniquely yours.</p>
      </div>

      {/* Upload area */}
      <div className="manhwa-card p-8 rounded-3xl mb-8">
        <div className="mb-4 font-medium">1. Name your style</div>
        <input
          value={styleName}
          onChange={(e) => setStyleName(e.target.value)}
          className="bg-black border border-zinc-800 px-4 py-2.5 w-full rounded-xl mb-7 text-lg"
          placeholder="My Dark School Noir Style"
        />

        <div className="mb-4 font-medium">2. Upload 5–12 reference manhwa images (PNG/JPG)</div>

        <label className="block border-2 border-dashed border-zinc-700 hover:border-[#b91c1c] rounded-2xl p-9 text-center cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-[#b91c1c] mb-1">DROP IMAGES OR CLICK TO UPLOAD</div>
          <div className="text-xs text-zinc-500">Best: high-res panels, consistent artist style, varied angles &amp; expressions</div>
        </label>

        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={URL.createObjectURL(img)}
                  alt=""
                  className="rounded-lg aspect-square object-cover border border-zinc-800"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 bg-black text-xs px-1.5 py-px rounded text-red-400 border border-zinc-700 opacity-70 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={startTraining}
          disabled={isTraining || images.length < 4}
          className="manhwa-btn w-full mt-6 py-3.5 rounded-2xl text-base disabled:opacity-60"
        >
          {isTraining ? `TRAINING... ${progress}%` : `TRAIN CUSTOM LoRA STYLE (${images.length} images)`}
        </button>
        <div className="text-center text-[10px] text-zinc-500 mt-3">This is a full simulation. Real training would run on GPU clusters (Replicate / RunPod / custom) for 15-45 mins.</div>
      </div>

      {/* Trained styles */}
      <div>
        <div className="font-medium mb-3">Your Trained Styles</div>
        {trainedStyles.length === 0 && <div className="text-sm text-zinc-500">No custom styles yet. Train one above to unlock it everywhere in the app.</div>}

        <div className="grid md:grid-cols-2 gap-4">
          {trainedStyles.map((st) => (
            <div key={st.id} className="manhwa-card p-5 rounded-2xl text-sm">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-[#fecaca]">{st.name}</div>
                  <div className="text-xs text-zinc-400">{st.description}</div>
                </div>
                <div className="text-[10px] px-3 py-1 h-fit rounded bg-emerald-950 text-emerald-400">{st.status.toUpperCase()}</div>
              </div>
              <div className="text-xs mt-6 text-zinc-500">Trained on {st.imageCount} images • Ready for video generation</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-center text-zinc-500 mt-14">Production tip: Upload reference images to cloud storage and queue LoRA training on a GPU worker (Fal, Replicate, etc).</div>
    </div>
  );
}
