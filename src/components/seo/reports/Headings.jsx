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
    // Robust fallback for missing H1/H2
    if (headings.h1?.value !== 1)
        return "Your page should contain exactly one H1 for best SEO and accessibility. Add or fix your main heading.";
    if (headings.h2?.value < 1)
        return "Add at least one H2 to organize your content and help search engines understand subtopics.";
    if (headings.value && Object.values(headings.value).every((v) => v === 0))
        return "No headings detected. Add H1/H2/H3 tags to structure your content for both users and robots.";
    if (headings.h1?.passed && headings.h2?.passed)
        return "Excellent heading hierarchy! Search engines can easily interpret your content structure.";
    return "Improve your heading structure for better readability and SEO.";
}

function renderHeadingCounts(levels = {}) {
    const order = ["h1", "h2", "h3", "h4", "h5", "h6"];
    return (
        <div className="flex flex-row flex-wrap gap-2 mt-1">
            {order.map(level => (
                <div key={level} className="flex flex-col items-center p-2 bg-gray-50 rounded shadow-sm">
                    <span className="font-mono font-semibold text-gray-800">{level.toUpperCase()}</span>
                    <span className="text-lg font-bold text-gray-900">{levels[level] ?? 0}</span>
                </div>
            ))}
        </div>
    );
}

const Headings = ({ headings }) => {
    if (!headings) return null;
    const { h1, h2, value: levelCounts } = headings;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={headings.key || 'headings'}
                value={`item-${headings.key || 'headings'}`}
                className="rounded-xl border shadow-sm transition-transform duration-100 hover:-translate-y-1 hover:shadow-md"
                style={{
                    borderColor: "#eeeeee",
                    borderWidth: 2
                }}
            >
                <AccordionTrigger
                    className="flex items-center px-3 py-2 gap-3 no-underline transition-colors"
                    style={{
                        borderBottom: "none",
                        textDecoration: "none",
                        boxShadow: "none",
                    }}
                >
                    <span className="p-2 rounded-full bg-white shadow-sm ring-1 ring-gray-100 flex items-center">
                        <Heading1 size={20} className="text-sky-600" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        Headings
                    </span>
                    {/* H1 badge */}
                    {h1 && (
                        <span
                            className={
                                "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                                getStatusBadgeClasses(h1.status)
                            }
                        >
                            H1: {h1.status}
                        </span>
                    )}
                    {/* H2 badge */}
                    {h2 && (
                        <span
                            className={
                                "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                                getStatusBadgeClasses(h2.status)
                            }
                        >
                            H2: {h2.status}
                        </span>
                    )}
                </AccordionTrigger>
                <AccordionContent>
                    {/* Heading counts summary */}
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Headings breakdown:</strong>
                        {renderHeadingCounts(levelCounts)}
                    </div>
                    {/* Individual messages for H1/H2 */}
                    <div className="px-3 pb-2 text-sm text-gray-700">
                        {h1?.message && (
                            <div>
                                <strong>H1:</strong> {h1.message} <span className="ml-2 text-gray-900 font-semibold">{h1.value}</span>
                            </div>
                        )}
                        {h2?.message && (
                            <div>
                                <strong>H2:</strong> {h2.message} <span className="ml-2 text-gray-900 font-semibold">{h2.value}</span>
                            </div>
                        )}
                    </div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(headings)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Headings;
