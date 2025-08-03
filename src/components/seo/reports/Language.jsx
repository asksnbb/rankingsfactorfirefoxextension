import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";

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
        return "No language specified ('lang' attribute missing). Search engines may misinterpret your page content or rank it incorrectly for language-specific queries.";
    }
    switch (status) {
        case "Excellent":
            return `This page declares its primary language ('${value}'). Search engines will use this to serve or rank the page for relevant audiences.`;
        case "Good":
            return "A language attribute is present, but it could be more specific or consistent across the site for best results.";
        default:
            return "Without a language attribute, your page may not rank properly in international or language-specific search; add one.";
    }
}

const Language = ({ language }) => {
    if (!language) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={language.key}
                value={`item-${language.key}`}
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
                        <Globe size={20} className="text-teal-600" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {language.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(language.status)
                        }
                    >
                        {language.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Language attribute:</strong> {language.value || "—"}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{language.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(language.status, language.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Language;
