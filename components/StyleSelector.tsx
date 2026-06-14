"use client";

import { MANHWA_STYLES } from "@/lib/constants";
import { ManhwaStyle } from "@/lib/types";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  customStyles?: Array<{ id: string; name: string; description: string }>;
}

export default function StyleSelector({ selectedId, onSelect, customStyles = [] }: Props) {
  return (
    <div>
      <div className="text-sm font-medium text-zinc-400 mb-3">MANHWA STYLE</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {MANHWA_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={`style-chip text-left p-3.5 rounded-xl border text-sm ${selectedId === style.id ? "active border-[#b91c1c]" : "border-zinc-800 hover:border-zinc-700"}`}
          >
            <div className="font-semibold text-white">{style.name}</div>
            <div className="text-xs text-zinc-500 mt-0.5 leading-tight">{style.description}</div>
          </button>
        ))}

        {/* Custom trained styles */}
        {customStyles.map((cs) => (
          <button
            key={cs.id}
            onClick={() => onSelect(cs.id)}
            className={`style-chip text-left p-3.5 rounded-xl border text-sm ${selectedId === cs.id ? "active border-[#b91c1c]" : "border-zinc-800 hover:border-zinc-700"}`}
          >
            <div className="font-semibold text-[#fecaca] flex items-center gap-1.5">
              {cs.name}
              <span className="text-[10px] px-1.5 py-px bg-[#3f1f1f] rounded">CUSTOM</span>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 leading-tight">{cs.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
