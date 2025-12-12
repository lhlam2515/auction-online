import React from "react";
import { Link, useLocation } from "react-router";

import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SidebarProps = {
  title?: string;
  items: MenuItem[];
  className?: string;
  width?: string;
};

const Sidebar = ({
  title = "Menu",
  items,
  className,
  width = "w-64",
}: SidebarProps) => {
  const location = useLocation();

  return (
    <div
      className={cn(
        width,
        "shrink-0 border-r bg-transparent shadow-sm",
        className
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <h2 className="px-3 text-lg font-semibold tracking-tight">{title}</h2>
        <nav className="space-y-2" aria-label={title}>
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export type { MenuItem, SidebarProps };
export default Sidebar;
