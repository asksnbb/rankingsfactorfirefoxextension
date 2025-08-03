import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Badge background/text classes by status
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

// Search engine opinion for meta robots status
function getSearchEngineOpinion(status, value) {
    if (value && typeof value === "string" && value.toLowerCase().includes("noindex")) {
        return "Search engines will NOT index this page due to ‘noindex’. The page will not appear in results.";
    }
    switch (status) {
        case "Excellent":
            return "This page is indexable and crawlable. Search engines will include and show this page in their results.";
        case "Good":
            return "This meta robots tag is generally okay, but could be improved for full indexability.";
        default:
            return "Your meta robots tag restricts indexing or crawling. Search engines may not index this page at all.";
    }
}

const MetaRobots = ({ metaRobots }) => {
    if (!metaRobots) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={metaRobots.key}
                value={`item-${metaRobots.key}`}
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
                        <ShieldCheck size={20} className="text-gray-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {metaRobots.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(metaRobots.status)
                        }
                    >
                        {metaRobots.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Robots tag:</strong> <span className="break-words">{metaRobots.value}</span>
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{metaRobots.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(metaRobots.status, metaRobots.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default MetaRobots;
