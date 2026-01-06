/**
 * Unified Sidebar Component
 * Single sidebar that adapts to user role using RoleGuard
 * Replaces ProfileSidebar, SellerSidebar, and AdminSidebar
 */

import type { UserRole } from "@repo/shared-types";
import { Link, useLocation } from "react-router";

import { RoleGuard } from "@/components/RoleGuard";
import {
  type MenuItem,
  SIDEBAR_ITEMS,
  SIDEBAR_SECTIONS,
} from "@/constants/sidebars";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  width?: string;
}

/**
 * Unified sidebar that shows menu items based on user role
 * Uses RoleGuard to control visibility of each menu item
 */
const Sidebar = ({ className, width = "w-64" }: SidebarProps) => {
  const location = useLocation();
  const { isActive: isActiveSeller, isExpired: isExpiredSeller } =
    useSellerStatus();

  // Group items by section for better organization
  const sections = ["account", "seller", "admin"] as const;

  /**
   * Get the display title for a menu item
   * Handles dynamic titles based on user context
   */
  const getItemTitle = (item: MenuItem): string => {
    if (!item.alternativeTitle) {
      return item.title;
    }

    const { condition, text } = item.alternativeTitle;

    // Check if alternative title condition is met
    if (condition === "expiredSeller" && isExpiredSeller) {
      return text;
    }

    if (condition === "activeSeller" && isActiveSeller) {
      return text;
    }

    return item.title;
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.url;
    const Icon = item.icon;

    // Check if item requires active seller
    const shouldShow = item.requireActiveSeller ? isActiveSeller : true;

    if (!shouldShow) {
      return null;
    }

    const displayTitle = getItemTitle(item);

    return (
      <Link
        key={item.url}
        to={item.url}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{displayTitle}</span>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        width,
        "shrink-0 border-r bg-transparent shadow-sm",
        className
      )}
    >
      <div className="flex h-full flex-col gap-2 p-4">
        {sections.map((sectionKey) => {
          const sectionItems = SIDEBAR_ITEMS.filter(
            (item) => item.section === sectionKey
          );

          if (sectionItems.length === 0) return null;

          // Get roles from first item to determine if section should show
          const sectionRoles = sectionItems[0]?.roles || [];

          return (
            <RoleGuard key={sectionKey} roles={sectionRoles as UserRole[]}>
              <div className="space-y-2">
                <h2 className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
                  {SIDEBAR_SECTIONS[sectionKey]}
                </h2>
                <nav
                  className="space-y-1"
                  aria-label={SIDEBAR_SECTIONS[sectionKey]}
                >
                  {sectionItems.map((item) => (
                    <RoleGuard key={item.url} roles={item.roles}>
                      {renderMenuItem(item)}
                    </RoleGuard>
                  ))}
                </nav>
              </div>
            </RoleGuard>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
