import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Image as ImageIcon } from "lucide-react";

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

function getSearchEngineOpinion(status, og) {
    if (!og.value || !og.value["og:title"] || !og.value["og:image"]) {
        return "Important Open Graph tags are missing or incomplete. Social platforms may not preview your page attractively.";
    }
    if (og.value["og:image:width"] && og.value["og:image:height"]) {
        return "Open Graph data is complete; social shares will have an optimized, rich preview—including a large, high-res image.";
    }
    switch (status) {
        case "Excellent":
            return "Your Open Graph markup is solid. Social media platforms will display a strong preview for this page.";
        case "Good":
            return "Partial Open Graph tags present. Fill in missing fields for best social results.";
        default:
            return "No Open Graph tags detected. Shares may look plain or get ignored.";
    }
}

function renderOpenGraphValues(obj) {
    if (typeof obj !== "object" || !obj) return null;
    return (
        <dl className="divide-y divide-gray-100">
            {Object.entries(obj).map(([key, value]) =>
                key === "og:image" || key === "og:image:secure_url" ? (
                    <div key={key} className="flex items-center py-1">
                        <dt className="w-40 text-gray-500 text-sm">{key}</dt>
                        <dd className="flex-1">
                            <img
                                src={value}
                                alt={obj["og:image:alt"] || ""}
                                className="h-14 rounded border"
                                style={{ maxWidth: 200, objectFit: "cover" }}
                            />
                        </dd>
                    </div>
                ) : (
                    <div key={key} className="flex items-center py-1">
                        <dt className="w-40 text-gray-500 text-sm">{key}</dt>
                        <dd className="flex-1 text-gray-800 text-sm break-all">{value}</dd>
                    </div>
                )
            )}
        </dl>
    );
}

const OpenGraph = ({ openGraph }) => {
    if (!openGraph) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={openGraph.key}
                value={`item-${openGraph.key}`}
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
                        <ImageIcon size={20} className="text-blue-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {openGraph.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(openGraph.status)
                        }
                    >
                        {openGraph.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Open Graph tags:</strong>
                        <div className="mt-1">{renderOpenGraphValues(openGraph.value)}</div>
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{openGraph.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(openGraph.status, openGraph)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default OpenGraph;
