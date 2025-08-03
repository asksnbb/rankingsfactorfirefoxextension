import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { SwatchBook } from "lucide-react";

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

function getSearchEngineOpinion(status, card) {
    if (!card || !card.value) return "No Twitter Card code was detected. Tweets linking to this page may not have rich previews.";
    if (card.value["twitter:card"] === "summary_large_image") {
        return "Links to this page on X (Twitter) will have an optimal large image and rich content preview, increasing engagement.";
    }
    switch (status) {
        case "Excellent":
            return "Proper Twitter Card tags ensure attractive previews for this page when shared on X (Twitter).";
        case "Good":
            return "Twitter Card tagging is present, but could be improved (add image, author, or description for richer sharing).";
        default:
            return "Twitter Card tagging is missing or incomplete. Shares may show generic link previews only.";
    }
}

function renderTwitterCardValues(obj) {
    if (typeof obj !== "object" || !obj) return null;
    return (
        <dl className="divide-y divide-gray-100">
            {Object.entries(obj).map(([key, value]) =>
                key === "twitter:image" ? (
                    <div key={key} className="flex items-center py-1">
                        <dt className="w-40 text-gray-500 text-sm">{key}</dt>
                        <dd className="flex-1">
                          <img
                            src={value}
                            alt={obj["twitter:description"] || ""}
                            className="h-12 rounded border"
                            style={{ maxWidth: 160, objectFit: "cover" }}
                          />
                        </dd>
                    </div>
                ) : (
                    <div key={key} className="flex items-center py-1">
                        <dt className="w-40 text-gray-500 text-sm">{key}</dt>
                        <dd className="flex-1 text-gray-800 text-sm">{value}</dd>
                    </div>
                )
            )}
        </dl>
    );
}

const TwitterCard = ({ twitterCard }) => {
    if (!twitterCard) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={twitterCard.key}
                value={`item-${twitterCard.key}`}
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
                        <SwatchBook size={20} className="text-sky-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {twitterCard.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(twitterCard.status)
                        }
                    >
                        {twitterCard.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Twitter Card tags:</strong>
                        <div className="mt-1">{renderTwitterCardValues(twitterCard.value)}</div>
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{twitterCard.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(twitterCard.status, twitterCard)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default TwitterCard;
