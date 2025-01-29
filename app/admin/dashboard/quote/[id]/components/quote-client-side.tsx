"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import PartsListTable from "./part-list-tab/parts-list-table";
import ReceivingTable from "./receiving-tab/receiving-table";
import InstallationTable from "./installation-tab/installation-table";
import RownCountSummary from "./row-count-summary-tab/row-count-summary";
import RowCounts from "./row-count-tab/row-counts-table";
import MiscCount from "./misc-count-tab/misc-count";
import TableComponent from "./bay-definition-tab/table-test2";
import BayCountTable from "./bay-count-tab/bay-count-table";
import FrameLineTable from "./frameline-definition-tab/frame-definition-table";
import FlueTable from "./flue-dinition-tab/flue-definition-table";
import FramilineCountTable from "./frameline-count-tab/frameline-count-table";
import FlueCountTable from "./flue-count-tab/flue-count";

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
      {tab === "bay-definitions" && <TableComponent quoteId={quoteId} />}
      {tab === "frameline-definition" && <FrameLineTable quoteId={quoteId} />}
      {tab === "flue-definition" && <FlueTable quoteId={quoteId} />}
      {tab === "bay-count" && <BayCountTable quoteId={quoteId} />}
      {tab === "frameline-count" && <FramilineCountTable quoteId={quoteId} />}
      {tab === "flue-counts" && <FlueCountTable quoteId={quoteId} />}
      {tab === "misc-counts" && <MiscCount />}
    </div>
  );
};

export default QuoteClientSide;
