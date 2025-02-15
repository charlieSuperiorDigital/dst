import QuoteClientSide from "./components/quote-client-side";
import { QuoteProvider } from "./context/quote-context";
import { getBayDefinitions } from "./lib/get-bay-definition";
import { getFlueDefinitions } from "./lib/get-flue-definitions";
import { getFramelineDefinitions } from "./lib/get-frameline-definition";
import { getSingleQuote } from "./lib/get-single-quote";
import QuoteWrapper from "./components/quote-wrapper";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const quote = await getSingleQuote(id);
  const bayDefinition = await getBayDefinitions(id);
  const framelineDefinition = await getFramelineDefinitions(id);
  const flueDefinition = await getFlueDefinitions(id);

  if (!quote) {
    return <div>Quote not found</div>;
  }

  const isLocked = quote.result.status === 2;
  const contextValue = {
    quote: quote.result,
    bayDefinition: bayDefinition.result,
    framelineDefinition: framelineDefinition.result,
    flueDefinition: flueDefinition.result,
    isLocked: isLocked,
  };

  return (
    <QuoteProvider initialValue={contextValue}>
      <QuoteWrapper quote={quote.result} quoteId={id} />
    </QuoteProvider>
  );
}
