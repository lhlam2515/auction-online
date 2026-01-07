import type { CategoryTree } from "@repo/shared-types";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProductCategoryFilterProps = {
  categoryTrees: CategoryTree[];
  value?: string;
  handleCategoryChange?: (categoryId: string) => void;
  className?: string;
};

const ProductCategoryFilter = ({
  categoryTrees,
  value,
  handleCategoryChange,
  className,
}: ProductCategoryFilterProps) => {
  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Danh mục</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className={cn(
            "h-8 w-full justify-start border-none px-2 font-medium shadow-none",
            { "bg-primary text-primary-foreground": value === "" }
          )}
          onClick={() => handleCategoryChange && handleCategoryChange("")}
        >
          Tất cả sản phẩm
        </Button>
        {categoryTrees.map((category) => (
          <div key={category.id} className="space-y-1">
            <Button
              variant="outline"
              className={cn(
                "h-8 w-full justify-start border-none px-2 font-medium shadow-none",
                { "bg-primary text-primary-foreground": value === category.id }
              )}
              onClick={() =>
                handleCategoryChange && handleCategoryChange(category.id)
              }
            >
              {category.name}
            </Button>

            <div className="ml-6 space-y-1">
              {category.children.map((child) => (
                <Button
                  key={child.id}
                  variant="ghost"
                  className={cn(
                    "text-muted-foreground h-8 w-full justify-start px-2 text-sm",
                    { "bg-primary/10 text-primary": value === child.id }
                  )}
                  onClick={() =>
                    handleCategoryChange && handleCategoryChange(child.id)
                  }
                >
                  {child.name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

/**
 * ProductCategoryFilterSkeleton - Loading state cho ProductCategoryFilter
 */
export const ProductCategoryFilterSkeleton = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <Card className={cn("animate-pulse gap-3", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Danh mục</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Skeleton cho các category items */}
        {Array.from({ length: 3 }, (_, index) => (
          <div key={`skeleton-category-${index}`} className="space-y-1">
            <div className="flex h-8 w-full items-center px-2">
              <div className="bg-muted mr-2 h-4 w-4 rounded" />
              <div className="bg-muted h-4 w-24 rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProductCategoryFilter;
