import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ListOrdered } from "lucide-react";

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

// Search engine opinion for heading hierarchy
function getSearchEngineOpinion(status, value) {
    if (!value || !Array.isArray(value) || value.length === 0) {
        return "No heading structure detected. Search engines may struggle to understand your content's organization.";
    }
    if (status === "Excellent") {
        return "Your heading order is excellent. Search engines will interpret your content structure as intended.";
    }
    if (status === "Good") {
        return "Some heading levels are skipped or out of order. This can confuse search engines and accessibility tools—review your heading sequence for smooth hierarchy (e.g. H2 should follow H1).";
    }
    // Needs work/other
    return "Major hierarchy or heading order issues detected. Fix headings to improve clarity for both users and search engines.";
}

// Visually render the heading hierarchy
function renderHeadingHierarchy(order = []) {
    if (!Array.isArray(order) || order.length === 0) return <em className="text-gray-400">No headings found</em>;
    return (
        <ol className="space-y-1 pl-1">
            {order.map((h, idx) => (
                <li
                    key={idx}
                    className={`rounded px-2 py-2 flex items-center space-x-2 ${
                        h.tag === "H1"
                            ? "bg-sky-50 font-bold text-sky-900"
                            : h.tag === "H2"
                            ? "bg-violet-50 font-semibold text-violet-800"
                            : "bg-gray-50 text-gray-800"
                    }`}
                >
                    <span className="font-mono w-10 text-xs">{h.tag}</span>
                    <span className="flex-1 truncate">{h.text}</span>
                </li>
            ))}
        </ol>
    );
}

const HeadingHierarchy = ({ headingHierarchy }) => {
    if (!headingHierarchy) return null;
    const { key, status, color, value, message } = headingHierarchy;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={key}
                value={`item-${key}`}
                className="rounded-xl border shadow-sm transition-transform duration-100 hover:-translate-y-1 hover:shadow-md"
                style={{ borderColor: "#eeeeee", borderWidth: 2 }}
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
                        <ListOrdered size={20} className="text-orange-600" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {key || "Heading Hierarchy"}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(status)
                        }
                    >
                        {status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-800 font-medium">
                        <strong>Visual outline of heading order:</strong>
                        <div className="pt-2">{renderHeadingHierarchy(value)}</div>
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(status, value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default HeadingHierarchy;
