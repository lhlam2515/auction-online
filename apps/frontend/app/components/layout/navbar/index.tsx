import type { CategoryTree } from "@repo/shared-types";
import { Heart, ShoppingCart } from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCOUNT_ROUTES, APP_ROUTES, AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

import CategoryNavBar from "./CategoryNavBar";
import SearchBar from "./SearchBar";
import UserDropdownMenu from "./UserDropdownMenu";

const Navbar = () => {
  const [categories, setCategories] = React.useState<CategoryTree[]>([]);
  const { user, isLoading, logout } = useAuth();

  // Fetch categories on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getAll();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        logger.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-50 w-full">
      <div className="container mx-auto space-y-2 py-2.5">
        <div className="flex min-h-16 items-center gap-8">
          <Link
            to={APP_ROUTES.HOME}
            className="flex shrink-0 items-center gap-2 text-2xl font-bold"
          >
            <ShoppingCart className="h-6 w-6 text-emerald-500" />
            Online Auction
          </Link>

          <SearchBar categories={categories} />

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {isLoading ? (
              <>
                <Skeleton className="bg-muted h-8 w-32" />
                <Skeleton className="bg-muted h-8 w-32" />
              </>
            ) : user ? (
              <>
                <Button asChild variant="ghost">
                  <Link to={ACCOUNT_ROUTES.WATCHLIST}>
                    <Heart className="h-6 w-6" />
                    Danh sách theo dõi
                  </Link>
                </Button>
                <UserDropdownMenu user={user} onLogout={logout} />
              </>
            ) : (
              <>
                <Button variant="secondary" className="min-w-28" asChild>
                  <Link to={AUTH_ROUTES.LOGIN}>Đăng nhập</Link>
                </Button>
                <Button variant="default" className="min-w-28" asChild>
                  <Link to={AUTH_ROUTES.REGISTER}>Đăng ký</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator className="bg-sidebar-foreground/50" />

        <CategoryNavBar categories={categories} />
      </div>
    </header>
  );
};

export default Navbar;
