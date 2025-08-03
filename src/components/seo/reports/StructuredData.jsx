import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Library } from "lucide-react";

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

function getSearchEngineOpinion(status, sd) {
    if (sd.value === 0) {
        return "No structured data is present. Enhanced search results (rich snippets) are unlikely for this page.";
    }
    switch (status) {
        case "Excellent":
            return "This page contains JSON-LD structured data. Search engines may generate rich results or enhanced features (like breadcrumbs, stars) for this page.";
        case "Good":
            return "Some structured data is present, but could be improved or expanded for maximum benefit.";
        default:
            return "No machine-readable structured data detected. Consider adding JSON-LD for better SEO and discovery.";
    }
}

const StructuredData = ({ structuredData }) => {
    if (!structuredData) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={structuredData.key}
                value={`item-${structuredData.key}`}
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
                        <Library size={20} className="text-indigo-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {structuredData.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(structuredData.status)
                        }
                    >
                        {structuredData.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Structured data detected:</strong>{" "}
                        {structuredData.value > 0
                            ? `${structuredData.value} block(s) found`
                            : "None"}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        {structuredData.message}
                    </div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    
                    {/* 🔽 Structured Data Viewer */}
                    <div className="px-3 pb-4">
                        {structuredData.data.map((item, index) => (
                            <div
                                key={index}
                                className="mb-4 rounded-md bg-gray-50 p-3 border border-gray-200 overflow-auto"
                            >
                                <div className="text-xs text-gray-500 mb-1 font-mono">
                                    Type:{" "}
                                    <span className="text-indigo-500">{item.type}</span>
                                </div>
                                <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words font-mono">
                                    {JSON.stringify(item.data, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                    
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong>{" "}
                        {getSearchEngineOpinion(structuredData.status, structuredData)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default StructuredData;
