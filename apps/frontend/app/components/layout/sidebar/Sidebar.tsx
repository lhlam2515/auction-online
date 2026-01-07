/**
 * Unified Sidebar Component
 * Single sidebar that adapts to user role using RoleGuard
 * Replaces ProfileSidebar, SellerSidebar, and AdminSidebar
 */

import type { UserRole } from "@repo/shared-types";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SIDEBAR_ITEMS,
  SIDEBAR_SECTIONS,
  type MenuItem,
} from "@/constants/sidebars";
import { useAuth } from "@/contexts/auth-provider";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { cn } from "@/lib/utils";

import { LogoutButton } from "./LogoutButton";
import { NavProfile } from "./NavProfile";
import { NavSection } from "./NavSection";

export interface NavSection {
  label: string;
  items: MenuItem[];
}

interface SidebarProps {
  className?: string;
  width?: string;
}

const Sidebar = ({ className, width }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const { isActive: isActiveSeller } = useSellerStatus();

  // Handle auto-collapse on smaller screens (but above mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      } else if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsOpenMobile(!isOpenMobile);

  // Group items by section
  const sectionKeys = ["account", "seller", "admin"] as const;

  const sidebarWidth = isCollapsed ? "lg:w-20" : width || "lg:w-64";

  return (
    <TooltipProvider>
      {/* Mobile Toggle Button - Floating */}
      <div className="focus-within:ring-primary fixed right-6 bottom-6 z-50 focus-within:ring-2 focus-within:ring-offset-2 lg:hidden">
        <Button
          onClick={toggleMobile}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12 rounded-full shadow-lg transition-transform active:scale-95"
          aria-label="Toggle navigation menu"
        >
          {isOpenMobile ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-90 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "bg-background shrink-0 transition-all duration-300 lg:bg-transparent",
          // Mobile Sidebar Drawer
          "fixed inset-y-0 left-0 z-100 w-[280px] -translate-x-full lg:static lg:block lg:translate-x-0",
          isOpenMobile && "translate-x-0 shadow-2xl",
          // Desktop Sticky Sidebar
          "lg:sticky lg:top-32 lg:z-40 lg:h-[calc(100vh-10rem)] lg:overflow-y-visible lg:border-r",
          sidebarWidth,
          className
        )}
      >
        <div className="flex h-full flex-col p-4">
          <NavProfile
            user={user}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleSidebar}
            onCloseMobile={() => setIsOpenMobile(false)}
          />

          <div className="scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent flex flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto pr-2">
            {sectionKeys.map((sectionKey) => {
              const allItems = SIDEBAR_ITEMS.filter(
                (item) => item.section === sectionKey
              );

              if (allItems.length === 0) return null;

              // Items allowed by role
              const sectionRoles = allItems[0]?.roles || [];

              // Filter out items that require active seller but status is inactive
              const filteredItems = allItems.filter(
                (item) => !item.requireActiveSeller || isActiveSeller
              );

              if (filteredItems.length === 0) return null;

              return (
                <RoleGuard key={sectionKey} roles={sectionRoles as UserRole[]}>
                  <NavSection
                    section={{
                      label: SIDEBAR_SECTIONS[sectionKey],
                      items: filteredItems,
                    }}
                    isCollapsed={isCollapsed}
                    onLinkClick={() => setIsOpenMobile(false)}
                  />
                </RoleGuard>
              );
            })}

            {/* Logout at bottom of scroll area */}
            <div className="border-border/50 mt-auto border-t pt-4">
              <LogoutButton
                onLogout={() => {
                  setIsOpenMobile(false);
                  logout();
                }}
                isCollapsed={isCollapsed}
              />
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
