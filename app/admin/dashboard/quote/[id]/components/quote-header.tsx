import { Quotes, QuotesStatus } from "@/app/entities/Quotes";
import { formatDate } from "@/utils/format-date";

type Props = {
  quote: Quotes;
};

const QuoteHeader = ({ quote }: Props) => {
  return (
    <header className="bg-white shadow-md p-6 rounded-md">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-gray-600">Quotes Name:</p>
          <h1 className="text-xl font-semibold text-gray-800">{quote.name}</h1>
          <p className="text-sm text-gray-500">Quotes Number: {quote.id}</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-gray-600">Author</p>
          <p className="text-lg font-semibold text-gray-800">
            {quote.responsible}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-gray-600">Date:</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatDate(quote.creationDate)}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-gray-600">Status:</p>
          <p className="text-lg font-semibold text-gray-800">
            {QuotesStatus[quote.status || 0]}
          </p>
        </div>
      </div>
    </header>
  );
};

export default QuoteHeader;
