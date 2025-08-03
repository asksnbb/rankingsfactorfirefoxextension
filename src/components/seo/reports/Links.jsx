import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon } from "lucide-react";

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
    if (!value || !("totalLinks" in value) || value.totalLinks === 0) {
        return "No links found on this page. This may limit crawlability and discovery of other pages.";
    }
    if (value.inactiveLinksCount > 0) {
        return `Detected ${value.inactiveLinksCount} inactive or broken links. Search engines and users may have a poor experience—fix or remove these links for best results.`;
    }
    switch (status) {
        case "Excellent":
            return "All links appear valid and working. Search engines and users can easily navigate your site.";
        case "Good":
            return "Most links are working, but it's worth checking for any potential issues.";
        default:
            return "Significant link issues detected—this will impact both SEO and UX.";
    }
}

const renderInactiveLinksTable = (inactiveLinks) => {
    if (!inactiveLinks || inactiveLinks.length === 0) return null;
    return (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-semibold text-red-700 mb-2">
                Inactive Links Preview:
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-red-800">
                    <thead>
                        <tr>
                            <th className="py-1 px-2 font-medium border-b border-red-200">Anchor Text</th>
                            <th className="py-1 px-2 font-medium border-b border-red-200">Href</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inactiveLinks.map((link, idx) => (
                            <tr key={idx}>
                                <td className="py-1 px-2 border-b border-red-100">{link.text || <em>(No text)</em>}</td>
                                <td className="py-1 px-2 border-b border-red-100 break-all">{link.href}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Links = ({ links }) => {
    if (!links) return null;

    const { key, status, value, message } = links;

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
                        <LinkIcon size={20} className="text-sky-700" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {key || "Links"}
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
                    <div className="px-3 pb-3 text-sm text-gray-700 space-y-2">
                        <div>
                            <strong>Total links:</strong> {value.totalLinks}<br />
                            <strong>Active links:</strong> {value.activeLinks}<br />
                            <strong>Inactive links:</strong> {value.inactiveLinksCount}
                        </div>
                        <div>{message}</div>
                        {renderInactiveLinksTable(value.inactiveLinks)}
                    </div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(status, value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Links;
