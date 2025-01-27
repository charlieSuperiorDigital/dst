"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import PartsListTable from "./part-list-tab/parts-list-table";
import ReceivingTable from "./receiving-tab/receiving-table";
import InstallationTable from "./installation-tab/installation-table";
import FrameLineDefinitionTable from "./frameline-definition-tab/frame-definition-table";
import FlueDefinitionTable from "./flue-dinition-tab/flue-definition-table";
import BayCounts from "./bay-count-tab/bay-count-table";
import FrameLineCounts from "./frameline-count-tab/frameline-count-table";
import FlueCounts from "./flue-count-tab/flue-count";
import RownCountSummary from "./row-count-summary-tab/row-count-summary";
import RowCounts from "./row-count-tab/row-counts-table";
import MiscCount from "./misc-count-tab/misc-count";
import TableComponent from "./bay-definition-tab/table-test2";

type Props = {
  quoteId: string;
};

const QuoteClientSide = ({ quoteId }: Props) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return (
    <div>
      {tab === "summary" && <RownCountSummary />}
      {tab === "row-count" && <RowCounts quoteId={quoteId} />}
      {tab === "part-list" && <PartsListTable quoteId={quoteId} />}
      {tab === "receiving" && <ReceivingTable />}
      {tab === "installation" && <InstallationTable />}
      {/* {tab === "bay-definitions" && <BayDefinitionTable quoteId={quoteId} />} */}
      {tab === "bay-definitions" && <TableComponent quoteId={quoteId} />}
      {tab === "frameline-definition" && <FrameLineDefinitionTable />}
      {tab === "flue-definition" && <FlueDefinitionTable />}
      {tab === "bay-count" && <BayCounts />}
      {tab === "frameline-count" && <FrameLineCounts />}
      {tab === "flue-counts" && <FlueCounts />}
      {tab === "misc-counts" && <MiscCount />}
    </div>
  );
};

export default QuoteClientSide;
