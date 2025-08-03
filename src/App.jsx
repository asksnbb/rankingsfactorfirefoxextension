import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Settings, Cpu, Earth } from 'lucide-react';
import SeoMainView from "./components/SeoMainView";
import AIMainView from "./components/AIMainView";
import WebsiteMainView from "./components/WebsiteMainView";

function App() {
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    // 1. Ask parent (content script) for SEO data
    window.parent.postMessage({ action: "requestSeoResult" }, "*");

    // 2. Listen for SEO result from content script
    const handler = (event) => {
      if (
        event.data &&
        event.data.action === "seoResult" &&
        event.data.data
      ) {
        setSeoData(event.data.data);
        console.log("📦 Received SEO Data from content script:", event.data.data);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="flex items-center justify-between sticky top-0 z-30 h-14 p-4 border-b border-gray-200 bg-[#3456f8] shadow-sm">
        <div className="flex items-center justify-between px-2">
          <div className="w-36">
            <img src="logo.svg" />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none">
              <Ellipsis className="rotate-90 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <a target="_blank" href="https://chromewebstore.google.com/detail/rankingsfactor/molbncmbnejfhbcflcdhdgcgdejnjinb/reviews?hl=en">Rate Us</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a target="_blank" href="https://forms.zohopublic.in/hiteshranking1/form/ProductFeedback/formperma/02vNJyN9bTr9WEp-6FEkmN2RYcvV1kdkU1V1ootRDKM?zf_rszfm=1">Feedback</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="flex w-full sticky p-0 top-14 z-20 rounded-none bg-white h-11 border-gray-200 shadow-sm overflow-hidden">
          <TabsTrigger
            value="seo"
            className="flex-1 text-center space-x-1 px-4 py-4 font-normal text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Settings size={16} />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger
            value="website"
            className="flex-1 text-center space-x-1 px-4 py-4 font-normal text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Earth size={16} />
            <span>Website</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="flex-1 text-center space-x-1 px-4 py-4 font-normal text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Cpu size={16} />
            <span>AI Insights</span>

          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="seo"
          className="mt-2 animate-fade-in transition-opacity duration-500"
        >
          <SeoMainView seoData={seoData} />
        </TabsContent>

        <TabsContent
          value="website"
          className="mt-6 animate-fade-in transition-opacity duration-500"
        >
          <WebsiteMainView/>
        </TabsContent>

        <TabsContent
          value="ai"
          className="mt-6 animate-fade-in transition-opacity duration-500"
        >
          <AIMainView/>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
