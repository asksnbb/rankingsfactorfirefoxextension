'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Gauge, MousePointer2, Timer, RefreshCcw, Info, Play, Dot, HelpCircle
} from "lucide-react";
import { onCLS, onINP, onLCP, onTTFB } from "web-vitals";

/* -------------------- Thresholds & Utils -------------------- */
const THRESHOLDS = {
  LCP:  { good: 2.5,  poor: 4.0,  unit: "s"  },
  CLS:  { good: 0.10, poor: 0.25, unit: ""   },
  INP:  { good: 200,  poor: 500,  unit: "ms" },
  TTFB: { good: 800,  poor: 1800, unit: "ms" },
};

function statusFor(val, { good, poor }) {
  if (val == null) return "—";
  if (val <= good) return "Good";
  if (val >= poor) return "Needs work";
  return "OK";
}
function scaleTo100(v, good, poor) {
  if (v == null) return null;
  if (v <= good) return 100;
  if (v >= poor) return 0;
  return Math.round(100 * (1 - (v - good) / (poor - good)));
}
function compositeScore({ lcp, cls, inp, ttfb }) {
  const sLCP = scaleTo100(lcp,  THRESHOLDS.LCP.good,  THRESHOLDS.LCP.poor);
  const sCLS = scaleTo100(cls,  THRESHOLDS.CLS.good,  THRESHOLDS.CLS.poor);
  const sINP = scaleTo100(inp,  THRESHOLDS.INP.good,  THRESHOLDS.INP.poor);
  const sTTF = scaleTo100(ttfb, THRESHOLDS.TTFB.good, THRESHOLDS.TTFB.poor);

  const vals = [sLCP, sCLS, sINP, sTTF].filter(v => v != null);
  const score = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0) / vals.length) : null;

  const label = score == null
    ? "—"
    : score >= 90 ? "Excellent"
    : score >= 75 ? "Good"
    : score >= 60 ? "Average"
    : "Poor";

  return { score, label };
}
function colorFor(label) {
  switch (label) {
    case "Excellent": return { chip: "bg-emerald-50 text-emerald-700" };
    case "Good":      return { chip: "bg-blue-50 text-blue-700"     };
    case "Average":   return { chip: "bg-yellow-50 text-yellow-700" };
    case "Poor":      return { chip: "bg-red-50 text-red-700"       };
    default:          return { chip: "bg-gray-50 text-gray-700"     };
  }
}
function statChip(status) {
  return `px-2 py-0.5 rounded-full text-[10px] font-medium ${
    status === "Good"       ? "bg-emerald-50 text-emerald-700" :
    status === "OK"         ? "bg-yellow-50 text-yellow-700"   :
    status === "Needs work" ? "bg-red-50 text-red-700"         :
                              "bg-gray-50 text-gray-600"
  }`;
}
function barClass(status) {
  return status === "Good"       ? "bg-emerald-500"
       : status === "OK"         ? "bg-yellow-500"
       : status === "Needs work" ? "bg-red-500"
       : "bg-gray-300";
}
function supportsEntryType(type) {
  return typeof PerformanceObserver !== "undefined"
    && Array.isArray(PerformanceObserver.supportedEntryTypes)
    && PerformanceObserver.supportedEntryTypes.includes(type);
}

/* ------------------ Main Component ------------------ */
export default function WebVitals() {
  const [running, setRunning] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [metrics, setMetrics] = useState({
    lcp: null, cls: null, inp: null, ttfb: null,
    provisionalINP: true, lastUpdated: null
  });
  const cancelRef = useRef({ cancelled: false });

  // Compute composite label and color
  const composite = useMemo(() => compositeScore(metrics), [metrics]);
  const palette = colorFor(composite.label);

  // Grab buffered LCP if needed (after "Run")
  const grabBufferedLCP = useCallback(() => {
    try {
      if (!supportsEntryType("largest-contentful-paint")) return false;
      const po = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (!entries.length) return;
        const last = entries[entries.length - 1];
        const sec = +(((last.renderTime || last.loadTime || last.startTime) || 0) / 1000).toFixed(2);
        setMetrics((prev) => prev.lcp != null ? prev : {
          ...prev, lcp: sec, lastUpdated: new Date()
        });
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => po.disconnect(), 0);
      return true;
    } catch { return false; }
  }, []);

  // Visibility LCP finalization (active after Run)
  useEffect(() => {
    if (!running) return;
    const onVis = () => {
      if (document.visibilityState === "hidden" && metrics.lcp == null) {
        grabBufferedLCP();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running, metrics.lcp, grabBufferedLCP]);

  // Start all listeners only on click "Run"
  const start = useCallback(() => {
    setRunning(true);
    setShowPanel(true);  // Auto show results panel on run
    setStartedAt(new Date());
    setMetrics({
      lcp: null, cls: null, inp: null, ttfb: null,
      provisionalINP: true, lastUpdated: null
    });
    cancelRef.current.cancelled = false;

    const emit = (next) => {
      if (cancelRef.current.cancelled) return;
      setMetrics((prev) => ({ ...prev, ...next, lastUpdated: new Date() }));
    };

    onLCP((m) => emit({ lcp: +(m.value / 1000).toFixed(2) }), { reportAllChanges: true });
    onCLS((m) => emit({ cls: +m.value.toFixed(3) }),         { reportAllChanges: true });
    onINP((m) => emit({ inp: Math.round(m.value), provisionalINP: false }), { reportAllChanges: true });
    onTTFB((m) => emit({ ttfb: Math.round(m.value) }));

    setTimeout(() => {
      if (!cancelRef.current.cancelled && metrics.lcp == null) grabBufferedLCP();
    }, 120);
  }, [grabBufferedLCP, metrics.lcp]);

  // Reset listeners and UI
  const reset = useCallback(() => {
    cancelRef.current.cancelled = true;
    setRunning(false);
    setShowPanel(false);
    setStartedAt(null);
    setMetrics({
      lcp: null, cls: null, inp: null, ttfb: null,
      provisionalINP: true, lastUpdated: null
    });
  }, []);

  // Table rows for metrics
  const lcpSupported = supportsEntryType("largest-contentful-paint");
  const rows = [
    {
      key: "LCP", icon: <Gauge className="h-4 w-4" />,
      value: metrics.lcp, unit: "s",
      status: lcpSupported ? statusFor(metrics.lcp, THRESHOLDS.LCP) : "—",
      percent: lcpSupported ? scaleTo100(metrics.lcp, THRESHOLDS.LCP.good, THRESHOLDS.LCP.poor) : null,
      help: lcpSupported ? "Largest Contentful Paint" : "- LCP not supported in this browser.",
      legend: lcpSupported ? `Good ≤ ${THRESHOLDS.LCP.good}s, Poor ≥ ${THRESHOLDS.LCP.poor}s` : "—",
      unsupported: !lcpSupported,
    },
    {
      key: "CLS", icon: <LayoutIcon />,
      value: metrics.cls, unit: "",
      status: statusFor(metrics.cls, THRESHOLDS.CLS),
      percent: scaleTo100(metrics.cls, THRESHOLDS.CLS.good, THRESHOLDS.CLS.poor),
      help: "Cumulative Layout Shift — visual stability.",
      legend: `Good ≤ ${THRESHOLDS.CLS.good}, Poor ≥ ${THRESHOLDS.CLS.poor}`,
    },
    {
      key: "INP", icon: <MousePointer2 className="h-4 w-4" />,
      value: metrics.inp, unit: "ms",
      status: statusFor(metrics.inp, THRESHOLDS.INP),
      percent: scaleTo100(metrics.inp, THRESHOLDS.INP.good, THRESHOLDS.INP.poor),
      help: metrics.provisionalINP ? "Interaction to Next Paint — interact to finalize." : "Interaction to Next Paint — lower is better.",
      legend: `Good ≤ ${THRESHOLDS.INP.good}ms, Poor ≥ ${THRESHOLDS.INP.poor}ms`,
      provisional: metrics.provisionalINP,
    },
    {
      key: "TTFB", icon: <Timer className="h-4 w-4" />,
      value: metrics.ttfb, unit: "ms",
      status: statusFor(metrics.ttfb, THRESHOLDS.TTFB),
      percent: scaleTo100(metrics.ttfb, THRESHOLDS.TTFB.good, THRESHOLDS.TTFB.poor),
      help: "Time To First Byte — server response latency.",
      legend: `Good ≤ ${THRESHOLDS.TTFB.good}ms, Poor ≥ ${THRESHOLDS.TTFB.poor}ms`,
    },
  ];
  const visibleRows = rows.filter(r => r.unsupported ? true : r.value != null);
  const hasAny = rows.some(r => r.value != null);

  return (
    <Card className="w-full rounded-2xl shadow-sm border">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Core Web Vitals
          </CardTitle>
          <div className="flex items-center gap-2">
            {!running ? (
              <Button size="sm" onClick={start} className="gap-1">
                <Play className="h-4 w-4" /> Run Web Vitals
              </Button>
            ) : (
              <>
                <Button size="sm" variant="secondary" onClick={() => setShowPanel(!showPanel)}>
                  {showPanel ? "Hide" : "Show"} Results
                </Button>
                <Button size="sm" variant="secondary" onClick={reset} className="gap-1">
                  <RefreshCcw className="h-4 w-4" /> Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {running && !hasAny && (
          <div className="text-[11px] text-muted-foreground" aria-live="polite">
            Collecting metrics… interact to finalize <span className="font-medium">INP</span>.
          </div>
        )}

        {showPanel && (hasAny || rows.some(r => r.unsupported)) && (
          <div
            className="relative rounded-xl border p-3 transition-all duration-200"
            role="region" aria-label="Core Web Vitals results"
          >
            {/* Composite label and score (no circular progress / no /100) */}
            <CompositeHeader palette={palette} composite={composite} startedAt={startedAt} metrics={metrics} />

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleRows.map((row) => (
                <div key={row.key} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {row.icon}
                      <div className="text-sm font-medium">{row.key}</div>
                    </div>
                    <span className={statChip(row.status)}>
                      {row.unsupported ? "N/A" : row.status}
                      {row.key === "INP" && row.provisional ? " • live" : ""}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-lg font-semibold">
                      {row.unsupported ? "—" : row.value}
                      {row.unit && <span className="ml-1 text-sm text-muted-foreground">{row.unit}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> {row.help}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full ${barClass(row.status)} transition-[width] duration-300`}
                      style={{ width: `${row.percent ?? 0}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> {row.legend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------- CompositeHeader (NO /100, NO RING) ------------- */
function CompositeHeader({ palette, composite, startedAt, metrics }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${palette.chip}`}>
          {composite.label}
        </span>
        {composite.score != null && (
          <span className="ml-2 text-base font-bold">{composite.score}</span>
        )}
        {metrics.provisionalINP && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 inline-flex items-center gap-1">
            <Dot className="h-3 w-3" /> Live
          </span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {startedAt && <>Started {startedAt.toLocaleTimeString()}</>}{" "}
        {metrics.lastUpdated && <>• Updated {metrics.lastUpdated.toLocaleTimeString()}</>}
      </div>
    </div>
  );
}

/* ------------- Pure SVG for CLS icon ------------- */
function LayoutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="8" height="6" rx="1.5" className="stroke-current" strokeWidth="1.6"/>
      <rect x="13" y="3" width="8" height="12" rx="1.5" className="stroke-current" strokeWidth="1.6"/>
      <rect x="3" y="11" width="8" height="10" rx="1.5" className="stroke-current" strokeWidth="1.6"/>
    </svg>
  );
}
