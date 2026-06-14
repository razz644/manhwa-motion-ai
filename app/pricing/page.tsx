import Link from "next/link";

export default function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      desc: "Perfect for testing",
      features: ["3 videos per month", "All 6 base styles", "720p output", "Basic motion controls", "Community support"],
      cta: "Start for free",
      href: "/generate",
    },
    {
      name: "Creator",
      price: "$19",
      desc: "For regular creators & storytellers",
      features: ["Unlimited generations", "1080p + 9:16 vertical", "All models (Veo 3, Kling, Runway...)", "Priority queue", "Custom LoRA training (3 styles)", "Download MP4 + WebM", "Private library"],
      cta: "Start 14-day trial",
      href: "/generate",
      popular: true,
    },
    {
      name: "Studio",
      price: "$59",
      desc: "For teams and professional productions",
      features: ["Everything in Creator", "Unlimited custom LoRAs", "Team workspaces", "API access", "Commercial usage rights", "Dedicated support + SLA", "Early access to new models"],
      cta: "Contact sales",
      href: "/login",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="text-[#b91c1c] tracking-[2px] text-xs">PRICING</div>
        <div className="text-6xl tracking-[-2.2px] font-semibold mt-1">Create without limits.</div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {tiers.map((tier, i) => (
          <div key={i} className={`manhwa-card rounded-3xl p-7 flex flex-col ${tier.popular ? "ring-1 ring-[#b91c1c]" : ""}`}>
            {tier.popular && <div className="text-xs uppercase tracking-widest text-[#b91c1c] mb-1">MOST POPULAR</div>}
            <div className="text-2xl font-semibold">{tier.name}</div>
            <div className="mt-2 text-5xl font-semibold tracking-[-1.5px]">{tier.price}<span className="text-base align-super font-normal text-zinc-500">/mo</span></div>
            <div className="text-sm text-zinc-400 mt-1">{tier.desc}</div>

            <ul className="my-8 text-sm space-y-[13px] flex-1">
              {tier.features.map((f, idx) => <li key={idx}>• {f}</li>)}
            </ul>

            <Link href={tier.href} className={`manhwa-btn text-center py-3 rounded-2xl ${tier.popular ? "" : "manhwa-btn-secondary"}`}>
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="text-xs text-center mt-10 text-zinc-500 max-w-xs mx-auto">All paid plans include real AI video model credits. Custom LoRA training runs on our secure GPU fleet.</div>
    </div>
  );
}
