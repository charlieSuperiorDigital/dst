import QuoteClientSide from "./components/quote-client-side";
import QuoteHeader from "./components/quote-header";
import { QuoteProvider } from "./context/quote-context";

import { getBayDefinitions } from "./lib/get-bay-definition";
import { getSingleQuote } from "./lib/get-single-quote";
import QuoteTabs from "./quote-tabs";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const quote = await getSingleQuote(id);
  const bayDefinition = await getBayDefinitions(id);
  if (!quote) {
    return <div>Quote not found</div>;
  }
  const isLocked = quote.result.status === 2;
  const contextValue = {
    quote: quote.result,
    bayDefinition: bayDefinition.result,
    isLocked: isLocked,
  };

  return (
    <QuoteProvider initialValue={contextValue}>
      <QuoteHeader quote={quote.result} />
      <QuoteClientSide quoteId={id} />
      <QuoteTabs />
    </QuoteProvider>
  );
}
