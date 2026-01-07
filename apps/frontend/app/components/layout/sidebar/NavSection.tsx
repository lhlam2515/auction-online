import { cn } from "@/lib/utils";

import { NavItem } from "./NavItem";
import type { NavSection as NavSectionType } from "./Sidebar";

interface NavSectionProps {
  section: NavSectionType;
  isCollapsed: boolean;
  onLinkClick: () => void;
}

export const NavSection = ({
  section,
  isCollapsed,
  onLinkClick,
}: NavSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex px-3 transition-opacity duration-300">
        <h3
          className={cn(
            "text-muted-foreground/50 text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
            isCollapsed && "lg:hidden"
          )}
        >
          {section.label}
        </h3>
      </div>
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItem
            key={item.url}
            item={item}
            isCollapsed={isCollapsed}
            onClick={onLinkClick}
          />
        ))}
      </div>
    </div>
  );
};
