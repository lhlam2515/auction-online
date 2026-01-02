import { useEffect, useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn, formatPrice } from "@/lib/utils";

type ProductPriceFilterProps = {
  value: number[];
  minPrice?: number;
  maxPrice?: number;
  stepPrice?: number;
  handlePriceRangeChange: (value: number[]) => void;
  className?: string;
};

const ProductPriceFilter = ({
  minPrice,
  maxPrice,
  stepPrice,
  value,
  handlePriceRangeChange,
  className,
}: ProductPriceFilterProps) => {
  const min = minPrice || 0;
  const max = maxPrice || 50_000_000;
  const step = stepPrice || 1_000_000;

  // Internal state for smooth slider interaction
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal state with external value when it changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range Slider */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Khoảng giá</Label>
          <Slider
            min={min}
            max={max + step} // Allow "no limit" selection
            step={step}
            value={internalValue}
            onValueChange={(v) => {
              setInternalValue(v);
              handlePriceRangeChange(v);
            }}
            className="text-accent mt-2"
          />
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>{formatPrice(internalValue[0])}</span>
            <span>
              {internalValue[1] > max
                ? "Không giới hạn"
                : formatPrice(internalValue[1])}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPriceFilter;
