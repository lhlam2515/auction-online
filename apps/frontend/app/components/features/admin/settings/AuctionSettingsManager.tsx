import type { AuctionSettings } from "@repo/shared-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";

import { AuctionSettingsForm } from "./AuctionSettingsForm";

export const AuctionSettingsManager = () => {
  const [settings, setSettings] = useState<AuctionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.admin.auctionSettings.get();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        throw new Error("Không thể tải cài đặt đấu giá");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Không thể tải cài đặt đấu giá"
      );
      showError(error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (data: {
    extendThresholdMinutes: number;
    extendDurationMinutes: number;
  }) => {
    try {
      const response = await api.admin.auctionSettings.update(data);
      if (response.success && response.data) {
        setSettings(response.data);
        toast.success("Cập nhật cài đặt đấu giá thành công");
      } else {
        throw new Error("Không thể cập nhật cài đặt đấu giá");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Không thể cập nhật cài đặt đấu giá"
      );
      showError(error, errorMessage);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <Spinner />
        Đang tải cài đặt đấu giá...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {settings && (
        <AuctionSettingsForm
          settings={settings}
          onUpdate={handleUpdateSettings}
        />
      )}
    </div>
  );
};
