import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Recommendations = ({ recommendations }) => {
  if (!recommendations?.length) return null;

  const tipCount = recommendations.length;
  const highlight = tipCount > 5;

  return (
    <Card className="border shadow-sm rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${highlight ? "text-green-600" : "text-yellow-500"}`} />
            Smart SEO Suggestions
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 rounded-full ${highlight ? "bg-green-100 text-green-700 border-green-300" : "bg-yellow-100 text-yellow-700 border-yellow-300"}`}
          >
            {tipCount} tips
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-1">
        <Accordion type="single" collapsible className="border-none">
          <AccordionItem value="recommendations" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium no-underline hover:no-underline focus:no-underline px-0">
              View Suggestions
            </AccordionTrigger>
            <AccordionContent className="pb-2 mt-2">
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Recommendations;
