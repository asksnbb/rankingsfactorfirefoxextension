import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { CaseUpper } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

// Give search engine advice based on status/word count
function getSearchEngineOpinion(status, count) {
    if (typeof count === "number" && count < 150) {
        return "Your content is too short. Search engines may consider this page 'thin' and rank it poorly.";
    }
    if (typeof count === "number" && count < 300) {
        return "Your content could be longer to maximize ranking opportunity, but is acceptable.";
    }
    switch (status) {
        case "Excellent":
            return "Great job! This length gives you ample opportunity to rank for your topic and offer value.";
        case "Good":
            return "This length is decent, but longer, more comprehensive content can often perform better.";
        default:
            return "Very low word count. Search engines may ignore or deprioritize this page.";
    }
}

const WordCount = ({ wordCount }) => {
    if (!wordCount) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={wordCount.key}
                value={`item-${wordCount.key}`}
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
                        <CaseUpper size={20} className="text-gray-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {wordCount.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(wordCount.status)
                        }
                    >
                        {wordCount.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Word count:</strong> {wordCount.value}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{wordCount.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(wordCount.status, wordCount.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default WordCount;
