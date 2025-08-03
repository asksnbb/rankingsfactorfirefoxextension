import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Gauge, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getStatus = (key, value) => {
  const val = parseFloat(value);
  if (key === "LCP") return val < 2.5 ? "pass" : val < 4 ? "warn" : "fail";
  if (key === "CLS") return val < 0.1 ? "pass" : val < 0.25 ? "warn" : "fail";
  if (key === "INP") return val < 200 ? "pass" : val < 500 ? "warn" : "fail";
  return "neutral";
};

const getStatusBadge = (status) => {
  const baseClass = "pointer-events-none";
  if (status === "pass")
    return (
      <Badge className={`bg-green-100 text-green-700 border-green-300 ${baseClass}`}>
        Passed
      </Badge>
    );
  if (status === "warn")
    return (
      <Badge className={`bg-yellow-100 text-yellow-800 border-yellow-300 ${baseClass}`}>
        Needs Improvement
      </Badge>
    );
  if (status === "fail")
    return (
      <Badge className={`bg-red-100 text-red-700 border-red-300 ${baseClass}`}>
        Failed
      </Badge>
    );
  return (
    <Badge variant="outline" className={`text-muted-foreground ${baseClass}`}>
      N/A
    </Badge>
  );
};

const formatValue = (key, value) => {
  if (key === "CLS") return value; // Already formatted as 0.001-style float
  const msKeys = ["INP", "TTFB", "DOMLoad", "PageLoad", "RequestDuration"];
  if (msKeys.includes(key)) {
    const seconds = (value / 1000).toFixed(2);
    return `${seconds}s`;
  }
  return `${value}s`;
};

const WebVitalsPanel = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.action === "webVitals") {
        const vitals = event.data.data;

        setMetrics({
          LCP: vitals.LCP ? (vitals.LCP / 1000).toFixed(2) : undefined,
          CLS: vitals.CLS !== undefined ? vitals.CLS.toFixed(3) : undefined,
          INP: vitals.FID, // You can rename this in the backend if needed
          TTFB: vitals.TTFB,
          FCP: vitals.FCP ? (vitals.FCP / 1000).toFixed(2) : undefined,
          DOMLoad: vitals.DOMLoad,
          PageLoad: vitals.PageLoad,
          RequestDuration: vitals.RequestDuration,
        });
      }
    };

    window.parent.postMessage({ action: "webVitals" }, "*");
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const coreVitals = ["LCP", "CLS", "INP"];
  const otherMetrics = ["TTFB", "FCP", "DOMLoad", "PageLoad", "RequestDuration"];

  return (
    <Card className="border shadow-sm rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-600" />
            Web Vitals Report
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 rounded-full pointer-events-none"
          >
            {metrics ? `${Object.keys(metrics).length} metrics` : "Waiting..."}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-2">
        {!metrics ? (
          <div className="text-sm text-muted-foreground py-4 px-2">
            Loading... Web Vitals
          </div>
        ) : (
          <Accordion type="single" collapsible className="border-none">
            <AccordionItem value="vitals" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium no-underline hover:no-underline px-0 focus:no-underline">
                View Details
              </AccordionTrigger>
              <AccordionContent className="pb-2 mt-2 space-y-4">
                {/* Core Web Vitals */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Core Web Vitals
                  </h4>
                  <ul className="space-y-2">
                    {coreVitals.map((key) =>
                      metrics[key] !== undefined ? (
                        <li
                          key={key}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {getStatus(key, metrics[key]) === "pass" && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {getStatus(key, metrics[key]) === "warn" && (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            )}
                            {getStatus(key, metrics[key]) === "fail" && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>{key}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {formatValue(key, metrics[key])}
                            </span>
                            {getStatusBadge(getStatus(key, metrics[key]))}
                          </div>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>

                {/* Other Metrics */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Other Metrics
                  </h4>
                  <ul className="space-y-2">
                    {otherMetrics.map((key) =>
                      metrics[key] !== undefined ? (
                        <li
                          key={key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{key}</span>
                          <span className="font-medium text-foreground">
                            {formatValue(key, metrics[key])}
                          </span>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>

                {/* Note */}
                <div className="mt-4 text-xs text-muted-foreground">
                  Note: These vitals are measured locally in your browser and may vary based on cache, device performance, and hydration timing.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default WebVitalsPanel;
