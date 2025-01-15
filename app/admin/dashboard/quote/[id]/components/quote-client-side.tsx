"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import PartsListTable from "./part-list-tab/parts-list-table";
import ReceivingTable from "./receiving-tab/receiving-table";
import InstallationTable from "./installation-tab/installation-table";
import BayDefinitionTable from "./bay-definition-tab/bay-definition-table";
import FrameLineDefinitionTable from "./frameline-definition-tab/frame-definition-table";
import FlueDefinitionTable from "./flue-dinition-tab/flue-definition-table";
import BayCounts from "./bay-count-tab/bay-count-table";
import FrameLineCounts from "./frameline-count-tab/frameline-count-table";
import FlueCounts from "./flue-count-tab/flue-count";

const QuoteClientSide = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return (
    <div>
      {tab === "part-list" && <PartsListTable />}
      {tab === "receiving" && <ReceivingTable />}
      {tab === "installation" && <InstallationTable />}
      {tab === "bay-definitions" && <BayDefinitionTable />}
      {tab === "frameline-definition" && <FrameLineDefinitionTable />}
      {tab === "flue-definition" && <FlueDefinitionTable />}
      {tab === "bay-count" && <BayCounts />}
      {tab === "frameline-count" && <FrameLineCounts />}
      {tab === "flue-counts" && <FlueCounts />}
    </div>
  );
};

export default QuoteClientSide;
