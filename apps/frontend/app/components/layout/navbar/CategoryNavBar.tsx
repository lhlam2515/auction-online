import type { CategoryTree } from "@repo/shared-types";
import { Link } from "react-router";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { APP_ROUTES } from "@/constants/routes";
import { buildUrlWithParams } from "@/lib/url";

const sortOptions = [
  { value: "hot", label: "Nổi bật" },
  { value: "ending-soon", label: "Sắp kết thúc" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
];

type CategoryNavBarProps = {
  categories: CategoryTree[];
};

const CategoryNavBar = ({ categories }: CategoryNavBarProps) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Tất cả danh mục</NavigationMenuTrigger>
          <NavigationMenuContent>
            {categories && (
              <ul
                className="mb-8 grid gap-12"
                style={{
                  gridTemplateColumns: `repeat(${categories.length}, minmax(10rem, 1fr))`,
                }}
              >
                {categories.map((category) => (
                  <div key={category.id}>
                    <div className="mb-4">
                      <Link
                        to={buildUrlWithParams(APP_ROUTES.SEARCH, [], {
                          category: category.id,
                        })}
                      >
                        <span className="text-lg font-semibold">
                          {category.name}
                        </span>
                      </Link>
                      <Separator className="my-2" />
                    </div>
                    <ul className="space-y-3">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to={buildUrlWithParams(APP_ROUTES.SEARCH, [], {
                              category: child.id,
                            })}
                          >
                            <span className="text-popover-foreground/70 hover:text-popover-foreground">
                              {child.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ul>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>
        {sortOptions.map((option) => (
          <NavigationMenuItem key={option.value}>
            <NavigationMenuLink asChild>
              <Link
                to={buildUrlWithParams(APP_ROUTES.SEARCH, [], {
                  sort: option.value,
                })}
              >
                {option.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default CategoryNavBar;
