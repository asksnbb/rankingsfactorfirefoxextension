import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Heading1 } from "lucide-react";

function getStatusBadgeClasses(status) {
    switch (status) {
        case "Excellent":
            return "bg-green-100 text-green-700 border-green-200";
        case "Good":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
            return "bg-red-100 text-red-700 border-red-200";
    }
}

function getSearchEngineOpinion(headings) {
  const hasNoHeadings =
    headings.value && Object.values(headings.value).every((v) => v === 0);

  if (hasNoHeadings)
    return "No headings detected. Add H1/H2/H3 tags to structure your content for users and search engines.";

  if (headings.h1?.value === 0)
    return "Missing H1 tag. Every page should have a single H1 for accessibility and SEO.";

  if (headings.h1?.value > 1)
    return "Too many H1 tags. Use only one H1 to define the main topic of your page.";

  if (headings.h2?.value < 1)
    return "Add at least one H2 heading to break your content into logical sections.";

  if (headings.h1?.passed && headings.h2?.passed)
    return "Excellent heading structure! Your page is optimized for readability and SEO.";

  return "Consider refining your heading structure to better structure the content.";
}


function renderHeadingCounts(levels = {}) {
    const order = ["h1", "h2", "h3", "h4", "h5", "h6"];
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            {order.map((level) => (
                <div
                    key={level}
                    className="flex flex-col items-center p-3 rounded-lg bg-white shadow border"
                >
                    <span className="text-xs font-semibold text-gray-500 uppercase">{level}</span>
                    <span className="text-xl font-bold text-gray-800">{levels[level] ?? 0}</span>
                </div>
            ))}
        </div>
    );
}

const Headings = ({ headings }) => {
    if (!headings) return null;
    const { h1, h2, value: levelCounts } = headings;

    return (
        <Accordion type="single" collapsible className="p-2">
            <AccordionItem
                value={`item-${headings.key || "headings"}`}
                className="rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-transform duration-100 hover:-translate-y-1"
            >
                <AccordionTrigger
                    className="flex items-center px-3 py-3 gap-2 !no-underline hover:!no-underline focus:!no-underline"
                    style={{ textDecoration: "none", boxShadow: "none" }}
                >
                    <span className="p-2 rounded-full bg-white shadow ring-1 ring-gray-100">
                        <Heading1 className="text-sky-600" size={20} />
                    </span>
                    <span className="flex-1 text-base font-semibold text-gray-800">Headings</span>

                    {h1 && (
                        <span
                            className={`ml-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${getStatusBadgeClasses(
                                h1.status
                            )}`}
                        >
                            H1: {h1.status}
                        </span>
                    )}
                    {h2 && (
                        <span
                            className={`ml-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${getStatusBadgeClasses(
                                h2.status
                            )}`}
                        >
                            H2: {h2.status}
                        </span>
                    )}
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4 text-sm">
                    <div className="mb-2">
                        <strong className="text-gray-800">Headings Breakdown:</strong>
                        {renderHeadingCounts(levelCounts)}
                    </div>

                    {(h1?.message || h2?.message) && (
                        <div className="mt-4 space-y-2 text-gray-700">
                            {h1?.message && (
                                <div>
                                    <strong>H1:</strong> {h1.message}
                                    <span className="ml-2 text-gray-900 font-semibold">({h1.value})</span>
                                </div>
                            )}
                            {h2?.message && (
                                <div>
                                    <strong>H2:</strong> {h2.message}
                                    <span className="ml-2 text-gray-900 font-semibold">({h2.value})</span>
                                </div>
                            )}
                        </div>
                    )}

                    <Separator className="my-4" />

                    <div className="italic text-blue-700">
                        <strong>Search Engine Insight:</strong> {getSearchEngineOpinion(headings)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Headings;
