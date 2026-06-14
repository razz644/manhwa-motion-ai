"use client";

import { EXAMPLE_PROMPTS } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAnalyze?: () => void;
  disabled?: boolean;
}

export default function PromptInput({ value, onChange, onAnalyze, disabled }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-zinc-400">YOUR STORY PROMPT</div>
        <button
          onClick={() => {
            const ex = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
            onChange(ex);
          }}
          className="text-xs text-[#b91c1c] hover:underline"
        >
          Try an example
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="A lonely girl standing in rain outside a school, emotional Korean manhwa style..."
        className="w-full h-28 resize-y min-h-[110px] bg-zinc-950 border border-zinc-800 focus:border-[#b91c1c] rounded-xl p-4 text-base placeholder:text-zinc-600 outline-none"
      />

      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        <div>{value.length}/280 recommended</div>
        {onAnalyze && (
          <button
            onClick={onAnalyze}
            disabled={!value.trim() || disabled}
            className="text-[#b91c1c] hover:underline disabled:opacity-50"
          >
            Analyze Scene with AI →
          </button>
        )}
      </div>
    </div>
  );
}
