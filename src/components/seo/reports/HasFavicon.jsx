import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

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
    if (!value) {
        return "No favicon detected. Browsers will show a blank or default icon for your page. Favicons help with branding and user recognition in SERPs and browser tabs.";
    }
    switch (status) {
        case "Excellent":
            return "Favicon found! Your site is visually identifiable in tabs, bookmarks, and even in Google search mobile cards.";
        case "Good":
            return "Favicon is present but could be improved (SVG or multiple sizes work best for all platforms).";
        default:
            return "Missing or misconfigured favicon. Add one to boost user trust and increase search appearance quality.";
    }
}

const HasFavicon = ({ hasFavicon }) => {
    if (!hasFavicon) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={hasFavicon.key}
                value={`item-${hasFavicon.key}`}
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
                        <Star size={20} className="text-yellow-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {hasFavicon.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(hasFavicon.status)
                        }
                    >
                        {hasFavicon.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Favicon present?:</strong> {hasFavicon.value ? "Yes" : "No"}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{hasFavicon.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong>{" "}
                        {getSearchEngineOpinion(hasFavicon.status, hasFavicon.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default HasFavicon;
