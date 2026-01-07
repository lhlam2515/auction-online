import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "destructive";

interface AlertSectionProps {
  variant?: AlertVariant;
  title?: string;
  description?: string | ReactNode;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  showIcon?: boolean;
}

const variantConfig: Record<
  AlertVariant,
  {
    icon: LucideIcon;
    containerClass: string;
    iconClass: string;
    descriptionClass: string;
  }
> = {
  info: {
    icon: Info,
    containerClass: "border-blue-300 bg-blue-50 text-blue-600",
    iconClass: "text-blue-600",
    descriptionClass: "text-blue-600",
  },
  success: {
    icon: CheckCircle2,
    containerClass: "border-emerald-300 bg-emerald-50 text-emerald-600",
    iconClass: "text-emerald-600",
    descriptionClass: "text-emerald-600",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "border-amber-300 bg-amber-50 text-amber-600",
    iconClass: "text-amber-600",
    descriptionClass: "text-amber-600",
  },
  destructive: {
    icon: XCircle,
    containerClass: "border-red-300 bg-red-50 text-red-600",
    iconClass: "text-red-600",
    descriptionClass: "text-red-600",
  },
};

const AlertSection = ({
  variant = "info",
  title,
  description,
  icon: CustomIcon,
  children,
  className,
  showIcon = true,
}: AlertSectionProps) => {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <Alert className={cn(config.containerClass, className)}>
      {showIcon && <Icon className={cn("h-4 w-4", config.iconClass)} />}
      {title && (
        <AlertTitle className="line-clamp-none font-semibold">
          {title}
        </AlertTitle>
      )}
      {description && (
        <AlertDescription className={cn(config.descriptionClass)}>
          {description}
        </AlertDescription>
      )}
      {children}
    </Alert>
  );
};

export default AlertSection;
