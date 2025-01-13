import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export enum QuotesStatus {
  New = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Executed = 5,
}

interface QuotesStatusDropdownProps {
  value: QuotesStatus;
  onChange: (value: QuotesStatus) => void;
}

export function QuotesStatusDropdown({
  onChange,
  value,
}: QuotesStatusDropdownProps) {
  // Convert enum to array of objects
  const statusOptions = Object.entries(QuotesStatus)
    .filter(([key]) => isNaN(Number(key))) // Exclude reverse mappings from the enum
    .map(([key, val]) => ({
      id: val as number,
      description: key,
    }));

  return (
    <Select
      onValueChange={(val) => onChange(Number(val) as QuotesStatus)}
      value={value.toString()}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status.id} value={status.id.toString()}>
            {status.description}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
