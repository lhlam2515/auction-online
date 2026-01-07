import { zodResolver } from "@hookform/resolvers/zod";
import { UserMinus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import logger from "@/lib/logger";

const kickBidderSchema = z.object({
  reason: z.string().min(10, "Lý do phải có ít nhất 10 ký tự"),
});

type KickBidderFormData = z.infer<typeof kickBidderSchema>;

interface KickBidderProps {
  bidderId: string;
  productId: string;
  bidderName: string;
  onSuccess?: () => void;
}

const KickBidderDialog = ({
  bidderId,
  productId,
  bidderName,
  onSuccess,
}: KickBidderProps) => {
  const [open, setOpen] = useState(false);
  const [isKicking, setIsKicking] = useState(false);

  const form = useForm<KickBidderFormData>({
    resolver: zodResolver(kickBidderSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleKickBidder = async (data: KickBidderFormData) => {
    if (!bidderId) return;

    setIsKicking(true);
    try {
      logger.info("Kicking bidder:", {
        bidderId,
        reason: data.reason,
      });

      const response = await api.bids.kickBidder(productId, {
        bidderId,
        reason: data.reason.trim(),
      });

      if (response.success) {
        handleClose();
        toast.success(`Đã chặn ${bidderName} khỏi phiên đấu giá`);
        onSuccess?.();
      } else {
        throw new Error(
          response.error.message || "Có lỗi khi chặn người đặt giá"
        );
      }
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Có lỗi khi chặn người đặt giá"
      );
      showError(error, errorMessage);
    } finally {
      setIsKicking(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive cursor-pointer"
        >
          <UserMinus className="h-4 w-4" />
          Chặn
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận chặn người đặt giá</DialogTitle>
          <DialogDescription className="text-accent">
            <p>
              Bạn có chắc chắn muốn chặn{" "}
              <span className="font-medium">{bidderName}</span> khỏi phiên đấu
              giá?
            </p>
            <p>Hành động này không thể hoàn tác.</p>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleKickBidder)} className="py-2">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Lý do chặn <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập lý do chặn người đặt giá (tối thiểu 10 ký tự)"
                      disabled={isKicking}
                    />
                  </FormControl>
                  <FormDescription>
                    Đã nhập: {field.value?.length || 0}/10 ký tự tối thiểu
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isKicking}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={form.handleSubmit(handleKickBidder)}
            disabled={isKicking || !form.formState.isValid}
            className="cursor-pointer"
          >
            {isKicking ? (
              <>
                <Spinner />
                Đang xử lý...
              </>
            ) : (
              <>
                <UserMinus />
                Chặn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KickBidderDialog;
