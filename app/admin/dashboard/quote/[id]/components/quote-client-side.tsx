"use client";
import { useSearchParams } from "next/navigation";
import React from "react";

const QuoteClientSide = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return <div>table{tab}</div>;
};

export default QuoteClientSide;
