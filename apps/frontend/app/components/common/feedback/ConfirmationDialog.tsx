import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ConfirmationVariant = "default" | "success" | "destructive" | "warning";

interface ConfirmationDialogProps {
  // Dialog state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Trigger button
  triggerLabel: string;
  triggerIcon?: LucideIcon;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary";
  triggerClassName?: string;
  onTriggerClick?: () => void;

  // Dialog content
  title: string;
  description: string | ReactNode;
  variant?: ConfirmationVariant;

  // Confirmation action
  confirmLabel?: string;
  confirmIcon?: LucideIcon;
  onConfirm: () => void | Promise<void>;
  isConfirming?: boolean;

  // Cancel action
  cancelLabel?: string;
  onCancel?: () => void;

  // Additional props
  disabled?: boolean;
  children?: ReactNode;
}

const variantConfig: Record<
  ConfirmationVariant,
  {
    confirmButtonClass: string;
    loadingText: string;
  }
> = {
  default: {
    confirmButtonClass: "",
    loadingText: "Đang xử lý...",
  },
  success: {
    confirmButtonClass: "bg-emerald-500 text-emerald-50 hover:bg-emerald-700",
    loadingText: "Đang xử lý...",
  },
  destructive: {
    confirmButtonClass: "",
    loadingText: "Đang hủy...",
  },
  warning: {
    confirmButtonClass: "bg-amber-500 text-amber-50 hover:bg-amber-700",
    loadingText: "Đang xử lý...",
  },
};

const ConfirmationDialog = ({
  open,
  onOpenChange,
  triggerLabel,
  triggerIcon: TriggerIcon,
  triggerVariant,
  triggerClassName,
  onTriggerClick,
  title,
  description,
  variant = "default",
  confirmLabel = "Xác nhận",
  confirmIcon: ConfirmIcon,
  onConfirm,
  isConfirming = false,
  cancelLabel = "Hủy",
  onCancel,
  disabled = false,
  children,
}: ConfirmationDialogProps) => {
  const config = variantConfig[variant];

  const handleTriggerClick = () => {
    if (onTriggerClick) {
      onTriggerClick();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={
            triggerVariant ||
            (variant === "destructive" ? "destructive" : "default")
          }
          className={cn(
            variant === "success" &&
              "bg-emerald-500 text-white hover:bg-emerald-700",
            triggerClassName
          )}
          onClick={handleTriggerClick}
          disabled={disabled || isConfirming}
        >
          {isConfirming ? (
            <>
              <Spinner className="h-4 w-4" />
              {config.loadingText}
            </>
          ) : (
            <>
              {TriggerIcon && <TriggerIcon className="h-4 w-4" />}
              {triggerLabel}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className={cn(
              variant !== "destructive" && config.confirmButtonClass
            )}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Spinner className="h-4 w-4" />
                {config.loadingText}
              </>
            ) : (
              <>
                {ConfirmIcon && <ConfirmIcon className="h-4 w-4" />}
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
export { type ConfirmationDialogProps, type ConfirmationVariant };
