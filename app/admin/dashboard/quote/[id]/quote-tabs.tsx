"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuote } from "./context/quote-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const tabItems = [
  { value: "summary", label: "Row Count Summary" },
  { value: "part-list", label: "Part List" },
  { value: "receiving", label: "Receiving" },
  { value: "installation", label: "Installation" },
  { value: "row-count", label: "Row Count" },
  { value: "bay-count", label: "Bay Count" },
  { value: "bay-definitions", label: "Bay Definitions" },
  { value: "frameline-count", label: "Frameline Count" },
  { value: "frameline-definition", label: "Frameline Definition" },
  { value: "flue-counts", label: "Flue Counts" },
  { value: "flue-definition", label: "Flue Definition" },
  { value: "misc-counts", label: "Misc Counts" },
  { value: "summary-area", label: "Summary-area" },
];

const QuoteTabs = () => {
  const { error } = useQuote();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState("summary");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  const hasBayErrors = error?.bays && error.bays.length > 0;
  const hasFramelineErrors = error?.framelines && error.framelines.length > 0;
  const hasFlueErrors = error?.flues && error.flues.length > 0;

  const bayErrorTooltip = hasBayErrors ? error.bays.join(", ") : "";
  const framelineErrorTooltip = hasFramelineErrors
    ? error.framelines.join(", ")
    : "";
  const flueErrorTooltip = hasFlueErrors ? error.flues.join(", ") : "";

  const getTabStyle = (tabValue: string) => {
    let style = "";
    if (tabValue === currentTab) {
      style += "bg-[#3A3C91]  text-white ";
    }
    if (
      (tabValue === "bay-definitions" && hasBayErrors) ||
      (tabValue === "frameline-definition" && hasFramelineErrors) ||
      (tabValue === "flue-definition" && hasFlueErrors)
    ) {
      style += "bg-red-500 text-white hover:bg-red-600 ";
    }
    return style;
  };

  const getTooltipContent = (tabValue: string) => {
    if (tabValue === "bay-definitions" && hasBayErrors) {
      return <p>No Def. in bays: {bayErrorTooltip}</p>;
    }
    if (tabValue === "frameline-definition" && hasFramelineErrors) {
      return <p>No Def. in framelines: {framelineErrorTooltip}</p>;
    }
    if (tabValue === "flue-definition" && hasFlueErrors) {
      return <p>No Def. in flues: {flueErrorTooltip}</p>;
    }
    return null;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <ScrollArea className="w-full">
        <Tabs onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start bg-gray-100">
            {tabItems.map((item) => (
              <TooltipProvider key={item.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={item.value}
                      className={`flex-shrink-0 data-[state=active]:bg-[#3A3C91] data-[state=active]:text-white ${getTabStyle(
                        item.value
                      )}`}
                    >
                      {item.label}
                    </TabsTrigger>
                  </TooltipTrigger>
                  {getTooltipContent(item.value) && (
                    <TooltipContent>
                      {getTooltipContent(item.value)}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </TabsList>
        </Tabs>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default QuoteTabs;
