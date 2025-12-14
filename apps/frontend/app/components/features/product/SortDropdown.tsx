import React from "react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/constants/api";
import { cn } from "@/lib/utils";

type SortDropdownProps = {
  handleSortChange?: (value: string) => void;
  className?: string;
  value?: string;
  [key: string]: any;
};

/**
 * Component: SortDropdown
 * Generated automatically based on Project Auction SRS.
 */
const SortDropdown = (props: SortDropdownProps) => {
  return (
    <div className={cn("", props.className)}>
      <Select onValueChange={props.handleSortChange} value={props.value}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Xếp theo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Mặc định</SelectItem>
          {Object.values(SORT_OPTIONS).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown;
