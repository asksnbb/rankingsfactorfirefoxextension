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

function getSearchEngineOpinion(status, value) {
    if (!value || value.total === 0) {
        return "No images found. If your content is visual, consider adding relevant, meaningful images with descriptive alt text for better SEO and user engagement.";
    }
    if (value.missingAlt > 0) {
        return `${value.missingAlt} image(s) lack alt text. Images without alt attributes can hurt accessibility and diminish SEO benefit. Ensure every image has a meaningful alt attribute.`;
    }
    switch (status) {
        case "Excellent":
            return `All ${value.total} image(s) have alt text. Search engines and assistive devices can interpret your images for better SEO and accessibility.`;
        case "Good":
            return "Most images have alt text, but ensure 100% coverage for best SEO and accessibility.";
        default:
            return "Significant image accessibility or SEO issues detected—review your image markup.";
    }
}

const Images = ({ images }) => {
    if (!images) return null;

    return (
        <Accordion type="single" collapsible className="p-2 space-y-3">
            <AccordionItem
                key={images.key}
                value={`item-${images.key}`}
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
                        <ImageIcon size={20} className="text-teal-500" />
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 text-base capitalize">
                        {images.key}
                    </span>
                    <span
                        className={
                            "ml-2 rounded px-2 py-0.5 text-xs font-semibold border " +
                            getStatusBadgeClasses(images.status)
                        }
                    >
                        {images.status}
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-3 pb-3 text-sm text-gray-700">
                        <strong>Total images:</strong> {images.value.total}<br />
                        <strong>Missing alt:</strong> {images.value.missingAlt}
                    </div>
                    <div className="px-3 pb-3 text-sm text-gray-700">{images.message}</div>
                    <div className="px-3">
                        <Separator className="my-4" />
                    </div>
                    <div className="px-3 pt-1 pb-3 text-sm text-blue-700 italic">
                        <strong>Search Engine Insights:</strong> {getSearchEngineOpinion(images.status, images.value)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default Images;
