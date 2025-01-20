import { QuotesTable } from "./components/quotes-table";
import { getAllUsers } from "./lib/gat-all-users";
import { getAllQoutes } from "./lib/get-all-quotes";

const quotes = async () => {
  const quotesResponse = await getAllQoutes();
  const getAllUser = await getAllUsers();
  console.log(getAllUser);
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
