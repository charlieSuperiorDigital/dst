"use client";

import { QuoteData } from "@/app/entities/quote-response";
import { Quotes } from "@/app/entities/Quotes";
import React, { createContext, useContext, ReactNode } from "react";

interface QuoteContextType {
  quote: Quotes;
  quoteData: QuoteData;
  isLocked: boolean;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: QuoteContextType;
}) {
  return (
    <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
}
