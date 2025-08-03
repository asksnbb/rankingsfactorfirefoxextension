import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Smartphone } from "lucide-react";

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
    if (!value || !value.includes("width=device-width")) {
        return "No mobile viewport tag found. Search engines may consider your page unfriendly or inaccessible to mobile users.";
    }
    switch (status) {
        case "Excellent":
            return "This page is mobile-optimized. Google and other search engines will recognize it as mobile-friendly.";
        case "Good":
            return "Viewport tag is present, but could use improvement for full compatibility.";
        default:
            return "Your page is not mobile-friendly. Mobile search rankings and user experience may suffer.";
    }
}

const MobileFriendly = ({ mobileFriendly }) => {
    if (!mobileFriendly) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={mobileFriendly.key}
                value={`item-${mobileFriendly.key}`}
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
                        <Smartphone size={20} className="text-purple-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {mobileFriendly.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(mobileFriendly.status)
                        }
                    >
                        {mobileFriendly.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Viewport tag:</strong> {mobileFriendly.value || "―"}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{mobileFriendly.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(mobileFriendly.status, mobileFriendly.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default MobileFriendly;
