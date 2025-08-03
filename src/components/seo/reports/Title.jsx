import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Type } from 'lucide-react';
import { Separator } from "@/components/ui/separator"

// Helper: chose badge bg/text color class based on status
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

function getSearchEngineOpinion(status) {
    switch (status) {
        case "Excellent":
            return "Search engines are likely to rank and display this title favorably.";
        case "Good":
            return "Search engines will accept this title, but it can be improved for the best results.";
        default:
            return "Search engines may not rank or display this title as desired. Consider revising.";
    }
}

const Title = ({ title }) => {
    if (!title) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={title.key}
                value={`item-${title.key}`}
                className="rounded-xl border shadow-sm transition-transform duration-100 hover:-translate-y-1 hover:shadow-md"
                // Use hex color for the border
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
                        <Type size={20} className="text-indigo-500" />
                    </span>

                    {/* Title text */}
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {title.key}
                    </span>
                    {/* Status badge */}
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(title.status)
                        }
                    >
                        {title.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Title:</strong> {title.value}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{title.message}</div>
                    <div className="px-3">
                        <Separator className="my-4"/>
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(title.status)}
                    </div>
                    
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Title;
