import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function SEOScoreCard({
  score = 65,
  delta = +5,                                   // change vs previous scan
  lastScan = "Just now",                        // e.g., "Jul 30, 2025 • 10:15"
  passSummary = { passed: 14, totalChecks: 16, passedOutOf: "14/16", passPercent: 88, pagewordCount: 1453 },
  metaSummary = {
    key: "metadata",
    passed: true,
    status: "Excellent",
    color: "#22c55e",
    value: { ok: 3, total: 3 },
  },
  recommendations = [
    "Some heading levels are skipped in the hierarchy.",
    "Add Open Graph meta tags",
    "Add structured data (JSON-LD)"
]
}) {
  const [pct, setPct] = useState(0);

  const status =
    score >= 90 ? "Excellent" :
    score >= 75 ? "Good" :
    score >= 50 ? "Average" : "Poor";

  const tone = {
    Excellent: { ring: "#16a34a", text: "text-green-600", bg: "bg-green-50" },
    Good:      { ring: "#2563eb", text: "text-blue-600",  bg: "bg-blue-50" },
    Average:   { ring: "#ca8a04", text: "text-yellow-600",bg: "bg-yellow-50" },
    Poor:      { ring: "#dc2626", text: "text-red-600",   bg: "bg-red-50" },
  }[status];

  // Animate from 0 -> score with ease-out
  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 900;
    const animate = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setPct(Math.round(eased * score));
      if (k < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const DeltaIcon = delta >= 0 ? TrendingUp : TrendingDown;
  const deltaText = `${delta >= 0 ? "+" : ""}${delta}`;

  // Derive meta values safely
  const metaOk = metaSummary?.value?.ok ?? null;
  const metaTotal = metaSummary?.value?.total ?? null;
  const metaLabel = metaOk != null && metaTotal != null ? `${metaOk}/${metaTotal}` : "—";
  const metaPassed = Boolean(metaSummary?.passed);
  const metaColor = metaSummary?.color || (metaPassed ? "#16a34a" : "#eab308"); // fallback hex

  return (
    <Card className="w-full rounded-2xl shadow-sm border">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">SEO Score</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tone.bg} ${tone.text}`}>
              {status}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {lastScan}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          {/* Pretty conic ring with soft glow */}
          <div className="relative shrink-0">
            <div
              className="relative size-28 rounded-full"
              style={{
                background: `conic-gradient(${tone.ring} ${pct * 3.6}deg, #e5e7eb 0)`,
              }}
              aria-label={`SEO score ${pct}`}
            >
              {/* glow */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ background: `radial-gradient(closest-side, ${tone.ring}, transparent)` }}
              />
              {/* inner cap */}
              <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
                <div className="text-center leading-none">
                  <div className="text-3xl font-bold">{pct}</div>
                  <div className="text-[10px] text-muted-foreground tracking-wider">/ 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info block */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <DeltaIcon className={`h-4 w-4 ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`} />
              <span className={`text-sm font-medium ${delta >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {deltaText} since last scan
              </span>
            </div>

            {/* Tiles: Words, Checks, Metadata */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {/* Words */}
              <div className="rounded-xl border p-2">
                <div className="text-[11px] text-muted-foreground">Words</div>
                <div className="text-sm font-semibold">{passSummary?.pagewordCount ?? "—"}</div>
              </div>

              {/* Checks (passSummary) */}
              <div className="rounded-xl border p-2">
                <div className="text-[11px] text-muted-foreground">Checks</div>
                <div className="text-sm font-semibold">{passSummary?.passedOutOf ?? "—"}</div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden" aria-label="Checks passed">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${passSummary?.passPercent ?? 0}%`, background: tone.ring }}
                  />
                </div>
              </div>

              {/* Metadata (replaces CWV) */}
              <div className="rounded-xl border p-2">
                <div className="text-[11px] text-muted-foreground">Metadata</div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  {metaLabel}
                  {metaPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: metaColor }} />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" style={{ color: metaColor }} />
                  )}
                </div>
                {/* Optional micro-bar to visualize completeness */}
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden" aria-label="Metadata completeness">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${metaOk && metaTotal ? Math.round((metaOk / metaTotal) * 100) : 0}%`,
                      background: metaColor,
                    }}
                  />
                </div>
              </div>
            </div>
            {/* {cwv && (
              <div className="mt-2 text-[11px] text-muted-foreground">
                LCP {cwv.lcp}s • CLS {cwv.cls} • INP {cwv.inp}ms
              </div>
            )} */}
            {/* No CWV footer anymore */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
