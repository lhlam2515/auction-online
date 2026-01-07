import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/constants/api";
import { cn } from "@/lib/utils";

type ProductSortControlProps = {
  value?: string;
  handleSortChange?: (value: string) => void;
  className?: string;
};

const ProductSortControl = (props: ProductSortControlProps) => {
  return (
    <div className={cn("", props.className)}>
      <Select onValueChange={props.handleSortChange} value={props.value}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Xếp theo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="default"
            className="hover:text-primary-foreground! hover:bg-primary!"
          >
            Mặc định
          </SelectItem>
          {Object.values(SORT_OPTIONS).map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:text-primary-foreground! hover:bg-primary!"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSortControl;
