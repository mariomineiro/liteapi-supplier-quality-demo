"use client";
import { useRouter, useSearchParams } from "next/navigation";

export const CITIES = [
  { slug: "pt-lisbon", label: "Lisbon, PT" },
  { slug: "pt-porto", label: "Porto, PT" },
  { slug: "gb-london", label: "London, GB" },
  { slug: "ie-dublin", label: "Dublin, IE" },
  { slug: "es-barcelona", label: "Barcelona, ES" },
  { slug: "es-palma", label: "Palma, ES" },
  { slug: "ma-casablanca", label: "Casablanca, MA" },
  { slug: "fr-paris", label: "Paris, FR" },
];

export default function CitySwitcher({ basePath }: { basePath: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const active = sp.get("city") || "pt-lisbon";
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
      {CITIES.map((c) => (
        <button key={c.slug} onClick={() => router.push(`${basePath}?city=${c.slug}`)} style={{
          padding: "6px 12px", fontSize: 12,
          background: c.slug === active ? "rgba(0,217,163,0.12)" : "var(--bg-elev)",
          border: `1px solid ${c.slug === active ? "var(--accent-dim)" : "var(--line)"}`,
          color: c.slug === active ? "var(--accent)" : "var(--ink-dim)",
          borderRadius: 6, cursor: "pointer", letterSpacing: 0.3,
        }}>{c.label}</button>
      ))}
    </div>
  );
}
