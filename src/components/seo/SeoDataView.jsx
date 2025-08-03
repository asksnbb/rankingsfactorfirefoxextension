// QuickAnalysisAccordion.jsx
"use client";

import { ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Title from "./reports/Title";
import Description from "./reports/Description";
import MetaRobots from "./reports/metaRobots";
import WordCount from "./reports/WordCount";
import TwitterCard from "./reports/TwitterCard";
import StructuredData from "./reports/StructuredData";
import OpenGraph from "./reports/OpenGraph";
import MobileFriendly from "./reports/MobileFriendly";
import Links from "./reports/Links";
import Language from "./reports/Language";
import Images from "./reports/Images";
import Headings from "./reports/Headings";
import HeadingHierarchy from "./reports/HeadingHierarchy";
import HasFavicon from "./reports/HasFavicon";
import Charset from "./reports/Charset";
import Canonical from "./reports/Canonical";

export default function SeoDataView({ seoData }) {
  const total = seoData?.passSummary?.totalChecks ?? 0;
  const passed = seoData?.passSummary?.passed ?? null;
  const percent = seoData?.passSummary?.passPercent ?? null;
  const label = seoData?.passSummary?.passedOutOf ?? (total ? `${passed}/${total}` : "—");

  const pillTone =
    typeof percent !== "number" ? "text-gray-700 border-gray-200"
      : percent >= 90 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : percent >= 75 ? "text-blue-700 bg-blue-50 border-blue-200"
          : percent >= 50 ? "text-yellow-700 bg-yellow-50 border-yellow-200"
            : "text-red-700 bg-red-50 border-red-200";

  return (
    <Card className="w-full rounded-2xl border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* Title + icon */}
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-base font-semibold tracking-tight">Page Analysis</CardTitle>
          </div>

          {/* Checks pill */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${pillTone}`}
            title={`Checks passed: ${label}`}
          >
            Checks <span className="tabular-nums font-semibold">{label}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-2 py-2">
        {/* Your sections (unchanged) */}
        <Title title={seoData?.title} />
        <Description description={seoData?.metaDescription} />
        <MetaRobots metaRobots={seoData?.metaRobots} />
        <WordCount wordCount={seoData?.wordCount} />
        <TwitterCard twitterCard={seoData?.twitterCard} />
        <StructuredData structuredData={seoData?.structuredData} />
        <OpenGraph openGraph={seoData?.openGraph} />
        <MobileFriendly mobileFriendly={seoData?.mobileFriendly} />
        <Links links={seoData?.links} />
        <Language language={seoData?.language} />
        <Images images={seoData?.images} />
        <Headings headings={seoData?.headings} />
        <HeadingHierarchy headingHierarchy={seoData?.headingHierarchy} />
        <HasFavicon hasFavicon={seoData?.hasFavicon} />
        <Charset charset={seoData?.charset} />
        <Canonical canonical={seoData?.canonical} />
      </CardContent>
    </Card>
  );
}
