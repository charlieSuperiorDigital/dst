// import PartsListTable from "@/app/admin/dashboard/components/parts-list-table";
import PartsTable from "./components/parts-table";
import { getAllParts } from "./lib/get-all-parts";

const dashboard = async () => {
  const partsResponse = await getAllParts();

  if (!partsResponse.result) {
    return <div>Error loading parts</div>;
  }

  return (
    <div>
      <PartsTable initialPartsResponse={partsResponse.result} />
    </div>
  );
};

export default dashboard;
