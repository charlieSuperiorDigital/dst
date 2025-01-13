import { QuotesTable } from "./components/quotes-table";
import { getAllQoutes } from "./lib/get-all-quotes";

const quotes = async () => {
  const quotesResponse = await getAllQoutes();
  console.log(quotesResponse);
  if (!quotesResponse.result) {
    return <div>Error loading quotes</div>;
  }
  return (
    <div>
      <QuotesTable initialQuotes={quotesResponse.result || []} />
    </div>
  );
};

export default quotes;
