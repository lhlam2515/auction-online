import { Package } from "lucide-react";
import { Link } from "react-router";

import { APP_ROUTES } from "@/constants/routes";

type ProductCellProps = {
  productId: string;
  name: string;
  imageUrl?: string | null;
};

/**
 * Reusable product cell component for product display
 */
const ProductCell = ({ productId, name, imageUrl }: ProductCellProps) => {
  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
          <Package className="text-muted-foreground h-5 w-5" />
        </div>
      )}
      <div>
        <Link
          to={APP_ROUTES.PRODUCT(productId)}
          className="font-medium hover:underline"
        >
          {name}
        </Link>
      </div>
    </div>
  );
};

export default ProductCell;
