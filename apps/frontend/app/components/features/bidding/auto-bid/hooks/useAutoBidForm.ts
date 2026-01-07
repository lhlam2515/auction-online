import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AutoBid,
  CreateAutoBidRequest,
  UpdateAutoBidRequest,
} from "@repo/shared-types";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { formatPrice } from "@/lib/utils";

// Create dynamic schema based on minRequiredBid and stepPrice
export const createBidSchema = (minRequiredBid: number, stepPrice: number) =>
  z.object({
    maxBid: z
      .string()
      .min(1, "Vui lòng nhập số tiền hợp lệ")
      .refine((val) => {
        const bidAmount = Number.parseInt(val.replace(/\D/g, ""));
        return !isNaN(bidAmount) && bidAmount > 0;
      }, "Vui lòng nhập số tiền hợp lệ")
      .refine(
        (val) => {
          const bidAmount = Number.parseInt(val.replace(/\D/g, ""));
          return bidAmount >= minRequiredBid;
        },
        `Giá đặt phải từ ${formatPrice(minRequiredBid)} trở lên`
      )
      .refine(
        (val) => {
          const bidAmount = Number.parseInt(val.replace(/\D/g, ""));
          return bidAmount % stepPrice === 0;
        },
        `Giá đặt phải là bội số của bước giá (${formatPrice(stepPrice)})`
      ),
  });

export type AutoBidFormData = z.infer<ReturnType<typeof createBidSchema>>;

type UseAutoBidFormProps = {
  productId: string;
  productName: string;
  minRequiredBid: number;
  stepPrice: number;
  onSuccess?: () => void;
};

export const useAutoBidForm = ({
  productId,
  productName,
  minRequiredBid,
  stepPrice,
  onSuccess,
}: UseAutoBidFormProps) => {
  const [existingAutoBid, setExistingAutoBid] = useState<AutoBid | null>(null);
  const [isLoadingAutoBid, setIsLoadingAutoBid] = useState(false);

  const form = useForm<AutoBidFormData>({
    resolver: zodResolver(createBidSchema(minRequiredBid, stepPrice)),
    defaultValues: {
      maxBid: "",
    },
  });

  const maxBid = form.watch("maxBid");
  const isUpdating = existingAutoBid !== null;

  // Fetch existing auto bid
  const fetchAutoBid = useCallback(async () => {
    setIsLoadingAutoBid(true);
    try {
      const response = await api.bids.getAutoBid(productId);
      if (response.success && response.data) {
        setExistingAutoBid(response.data);
      } else {
        setExistingAutoBid(null);
      }
    } catch {
      setExistingAutoBid(null);
    } finally {
      setIsLoadingAutoBid(false);
    }
  }, [productId]);

  const submitAutoBid = async () => {
    const { maxBid } = form.getValues();

    try {
      form.clearErrors();

      const bidAmount = Number.parseInt(maxBid.replace(/\D/g, ""));

      let response;
      if (isUpdating && existingAutoBid) {
        const updateData: UpdateAutoBidRequest = {
          maxAmount: bidAmount,
        };
        response = await api.bids.updateAutoBid(existingAutoBid.id, updateData);
      } else {
        const createData: CreateAutoBidRequest = {
          maxAmount: bidAmount,
        };
        response = await api.bids.createAutoBid(productId, createData);
      }

      if (!response.success) {
        throw new Error(
          response.error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        );
      }

      toast.success(
        isUpdating ? "Cập nhật giá thành công!" : "Đặt giá thành công!",
        {
          description: `Bạn đã ${isUpdating ? "cập nhật" : "đặt"} giá tối đa ${formatPrice(bidAmount)} cho sản phẩm "${productName}".`,
        }
      );

      form.reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        isUpdating
          ? "Có lỗi xảy ra khi cập nhật giá đấu tự động"
          : "Có lỗi xảy ra khi đặt giá đấu tự động"
      );

      form.setError("root", { message: errorMessage });
      showError(error, errorMessage);
      throw error;
    }
  };

  const resetForm = () => {
    form.reset({
      maxBid: "",
    });
    setExistingAutoBid(null);
  };

  return {
    form,
    maxBid,
    existingAutoBid,
    isUpdating,
    isLoadingAutoBid,
    fetchAutoBid,
    submitAutoBid,
    resetForm,
  };
};
