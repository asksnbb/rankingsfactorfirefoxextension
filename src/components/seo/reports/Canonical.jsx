import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Link2 } from "lucide-react";

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

// SEO opinion for canonical validity
function getSearchEngineOpinion(status, value) {
    if (!value) {
        return "No canonical URL is set. Search engines may face duplicate content issues or choose a canonical themselves, possibly impacting rankings.";
    }
    switch (status) {
        case "Excellent":
            return "Canonical tag is correctly set. Search engines will understand this is the preferred URL for this content, ensuring proper indexing.";
        case "Good":
            return "Canonical tag is present but may need review (check for correct domain, secure scheme, and absence of conflicting canonicals).";
        default:
            return "Missing or incorrect canonical tag can lead to duplicate content and split ranking signals.";
    }
}

const Canonical = ({ canonical }) => {
    if (!canonical) return null;
    const { key, status, color, value, message } = canonical;

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
                        <Link2 size={20} className="text-cyan-600" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {key}
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
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Canonical URL:</strong>{" "}
                        {value ? (
                            <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-800 underline break-all"
                            >
                                {value}
                            </a>
                        ) : (
                            <span className="text-red-600 font-bold">None</span>
                        )}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong>{" "}
                        {getSearchEngineOpinion(status, value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Canonical;
