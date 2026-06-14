"use client";

import { MOTION_CONTROLS } from "@/lib/constants";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function MotionControls({ selected, onToggle }: Props) {
  const cameras = MOTION_CONTROLS.filter((c) => c.category === "camera");
  const effects = MOTION_CONTROLS.filter((c) => c.category === "effect");
  const acting = MOTION_CONTROLS.filter((c) => c.category === "acting");

  const renderGroup = (title: string, items: typeof MOTION_CONTROLS) => (
    <div>
      <div className="uppercase tracking-[1px] text-xs font-medium text-zinc-500 mb-2 mt-4">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((ctrl) => {
          const active = selected.includes(ctrl.id);
          return (
            <button
              key={ctrl.id}
              onClick={() => onToggle(ctrl.id)}
              className={`control-toggle px-3.5 py-1.5 text-xs rounded-full border flex items-center gap-1.5 ${active ? "active border-[#b91c1c]" : "border-zinc-800 hover:border-zinc-700"}`}
            >
              {ctrl.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-sm font-medium text-zinc-400 mb-1">MOTION &amp; CINEMATIC CONTROLS</div>
      <div className="text-xs text-zinc-500 mb-2">Select any combination. These will be intelligently baked into your enhanced prompt.</div>

      {renderGroup("CAMERA MOVEMENT", cameras)}
      {renderGroup("ENVIRONMENTAL EFFECTS", effects)}
      {renderGroup("EMOTIONAL ACTING", acting)}
    </div>
  );
}
