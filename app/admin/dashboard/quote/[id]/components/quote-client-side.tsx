"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import PartsListTable from "./part-list-tab/parts-list-table";
import ReceivingTable from "./receiving-tab/receiving-table";
import InstallationTable from "./installation-tab/installation-table";
import RownCountSummary from "./row-count-summary-tab/row-count-summary";
import RowCounts from "./row-count-tab/row-counts-table";
import TableComponent from "./bay-definition-tab/bay-definition-table";
import BayCountTable from "./bay-count-tab/bay-count-table";
import FrameLineTable from "./frameline-definition-tab/frame-definition-table";
import FlueTable from "./flue-dinition-tab/flue-definition-table";
import FramilineCountTable from "./frameline-count-tab/frameline-count-table";
import FlueCountTable from "./flue-count-tab/flue-count";
import MiscTable from "./misc-count-tab/misc-count";
import { useQuote } from "../../[id]/context/quote-context";

type Props = {
  quoteId: string;
  refresh: number;
};

const QuoteClientSide = ({ quoteId, refresh }: Props) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { quote } = useQuote();

  return (
    <div>
      {tab === "summary" && <RownCountSummary quoteId={quoteId} />}
      {tab === "row-count" && <RowCounts quoteId={quoteId} />}
      {tab === "part-list" && <PartsListTable quoteId={quoteId} refresh={refresh} />}
      {tab === "receiving" && <ReceivingTable quoteId={quoteId} />}
      {tab === "installation" && <InstallationTable quoteId={quoteId} />}
      {tab === "bay-definitions" && <TableComponent quoteId={quoteId} />}
      {tab === "frameline-definition" && <FrameLineTable quoteId={quoteId} />}
      {tab === "flue-definition" && <FlueTable quoteId={quoteId} />}
      {tab === "bay-count" && <BayCountTable quoteId={quoteId} />}
      {tab === "frameline-count" && <FramilineCountTable quoteId={quoteId} />}
      {tab === "flue-counts" && <FlueCountTable quoteId={quoteId} />}
      {tab === "misc-counts" && <MiscTable quoteId={quoteId} />}
    </div>
  );
};

export default QuoteClientSide;
