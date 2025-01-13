import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaintType {
  id: number;
  description: string;
  name: string;
}

interface PaintTypeDropdownProps {
  paintTypes: PaintType[];
  value: string;
  onChange: (value: string) => void;
}

export function PaintTypeDropdown({
  paintTypes,
  onChange,
  value,
}: PaintTypeDropdownProps) {
  return (
    <Select onValueChange={onChange} value={value.toString()}>
      <SelectTrigger className=" w-[180px]">
        <SelectValue placeholder="Select a Color" />
      </SelectTrigger>
      <SelectContent>
        {paintTypes.map((paintType) => (
          <SelectItem key={paintType.id} value={paintType.id.toString()}>
            {paintType.description}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
