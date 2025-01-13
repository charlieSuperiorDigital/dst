"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

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
];

export default function SingleQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  return (
    <div className="flex flex-col ">
      <div className=" pb-16">{children}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <ScrollArea className="w-full">
          <Tabs onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start bg-gray-100">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex-shrink-0 data-[state=active]:bg-[#3A3C91] data-[state=active]:text-white"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
