import { QuotesStatus } from "@/app/entities/Quotes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuotesStatusDropdownProps {
  value: QuotesStatus;
  onChange: (value: QuotesStatus) => void;
}

export function QuotesStatusDropdown({
  onChange,
  value,
}: QuotesStatusDropdownProps) {
  const statusOptions = Object.entries(QuotesStatus)
    .filter(([key]) => isNaN(Number(key)))
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
