import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Terminal } from "lucide-react";

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

function getSearchEngineOpinion(status, value) {
    if (!value || value.toLowerCase() !== "utf-8") {
        return "Non-UTF-8 charset detected. Search engines may have difficulty crawling and correctly indexing non-UTF-8 pages, especially for international audiences.";
    }
    switch (status) {
        case "Excellent":
            return "Charset is UTF-8 — this is the modern standard and ensures proper indexing and rendering of all text by browsers and search engines.";
        case "Good":
            return "Charset is set, but should be UTF-8 for best compatibility.";
        default:
            return "Charset is missing or not supported. Add `<meta charset=\"UTF-8\">` for universal compatibility and SEO.";
    }
}

const Charset = ({ charset }) => {
    if (!charset) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={charset.key}
                value={`item-${charset.key}`}
                className="rounded-xl border shadow-sm transition-transform duration-100 hover:-translate-y-1 hover:shadow-md"
                style={{ borderColor:  "#eeeeee", borderWidth: 2 }}
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
                        <Terminal size={20} className="text-gray-800" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {charset.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(charset.status)
                        }
                    >
                        {charset.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Charset:</strong> {charset.value}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{charset.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong>{" "}
                        {getSearchEngineOpinion(charset.status, charset.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Charset;
