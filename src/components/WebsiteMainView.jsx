"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const WebsiteMainView = () => {
  return (
    <Card className="max-w-xl w-full mx-auto rounded-2xl border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl
                             bg-gradient-to-br from-indigo-500/15 to-emerald-500/15 ring-1 ring-black/5">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </span>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Something awesome is coming
            </CardTitle>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium
                           bg-amber-50 text-amber-700 border border-amber-200">
            Coming soon
          </span>
        </div>
        <CardDescription className="mt-2">
          We’re putting the final touches on a brand‑new feature to supercharge your workflow.
          Stay tuned—launching soon!
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Optional preview shimmer */}
        <div className="mt-1 space-y-2">
          <div className="h-2.5 w-2/3 rounded bg-gray-200/80 animate-pulse" />
          <div className="h-2.5 w-1/2 rounded bg-gray-200/70 animate-pulse" />
          <div className="h-2.5 w-3/5 rounded bg-gray-200/60 animate-pulse" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2">
        <Button asChild size="sm"><a target="_blank" href="https://forms.zohopublic.in/hiteshranking1/form/ProductFeedback/formperma/02vNJyN9bTr9WEp-6FEkmN2RYcvV1kdkU1V1ootRDKM?zf_rszfm=1">Give Suggestions</a></Button>
      </CardFooter>
    </Card>
  );
};

export default WebsiteMainView;
