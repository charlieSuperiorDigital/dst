"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import PartsListTable from "./part-list-tab/parts-list-table";
import ReceivingTable from "./receiving-tab/receiving-table";

const QuoteClientSide = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return (
    <div>
      {tab === "part-list" && <PartsListTable />}
      {tab === "receiving" && <ReceivingTable />}
    </div>
  );
};

export default QuoteClientSide;
