"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import QuoteHeader from "./quote-header";
import QuoteClientSide from "./quote-client-side";
import QuoteTabs from "../quote-tabs";
import { Quotes } from "@/app/entities/Quotes";

type Props = {
  quote: Quotes;
  quoteId: string;
};

export default function QuoteWrapper({ quote, quoteId }: Props) {
  const [refreshPartsList, setRefreshPartsList] = useState(0);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const handlePartAdded = () => {
    setRefreshPartsList(prev => prev + 1);
  };

  // Hide add part buttons in receiving, installation, and summary tabs, or if quote is completed
  const shouldShowAddPartButtons = tab !== "receiving" && 
    tab !== "installation" && 
    tab !== "summary" &&
    quote.status !== 2; // 2 represents Completed status

  return (
    <>
      <QuoteHeader 
        quote={quote} 
        onPartAdded={handlePartAdded} 
        showAddPartButtons={shouldShowAddPartButtons}
      />
      <QuoteClientSide quoteId={quoteId} refresh={refreshPartsList} />
      <QuoteTabs />
    </>
  );
} 