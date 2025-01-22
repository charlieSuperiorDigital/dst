import QuoteClientSide from "./components/quote-client-side";
import QuoteHeader from "./components/quote-header";
import { getSingleQuote } from "./lib/get-single-quote";
import { getSingleQuoteData } from "./lib/get-single-quote-data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const quote = await getSingleQuote(id);
  const quoteData = await getSingleQuoteData(id);

  if (!quote.result) {
    return <div>Quote not found</div>;
  }

  const rowsWithData = quoteData.result?.rows || [];
  const mappedrows = rowsWithData.map((row) => row.row);

  return (
    <div>
      <QuoteHeader quote={quote.result} />
      <QuoteClientSide
        quoteId={id}
        parts={quoteData.result.parts}
        rows={mappedrows}
        rowsWithData={rowsWithData}
      />
    </div>
  );
}
