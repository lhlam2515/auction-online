import { Package } from "lucide-react";
import { Link } from "react-router";

import { APP_ROUTES } from "@/constants/routes";

type BidProductCellProps = {
  productId: string;
  name: string;
  imageUrl?: string | null;
};

/**
 * Reusable product cell component for bid tables
 */
export const BidProductCell = ({
  productId,
  name,
  imageUrl,
}: BidProductCellProps) => {
  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
          <Package className="h-5 w-5 text-gray-400" />
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
