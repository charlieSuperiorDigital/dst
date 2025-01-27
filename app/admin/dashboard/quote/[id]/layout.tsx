import { QuoteProvider } from "./context/quote-context";
import QuoteTabs from "./quote-tabs";

export default async function SingleQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuoteProvider>
      <div className="flex flex-col ">
        <div className=" pb-16">{children}</div>
      </div>
    </QuoteProvider>
  );
}
