import React from "react";

import { cn } from "@/lib/utils";

interface PaymentMethodOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const PaymentMethodOption = ({
  title,
  description,
  selected,
  onSelect,
}: PaymentMethodOptionProps) => {
  return (
    <div
      className={cn("cursor-pointer rounded-lg border p-4 transition-colors", {
        "border-primary bg-primary/5": selected,
        "border-border hover:border-primary/50": !selected,
      })}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn("h-4 w-4 rounded-full border-2", {
            "border-primary bg-primary": selected,
            "border-muted-foreground/30": !selected,
          })}
        />
        <div className="flex-1">
          <p className="text-foreground font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodOption;
