import type { Product } from "@repo/shared-types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";

import { useAuth } from "./auth-provider";

interface WatchlistContextType {
  watchList: string[];
  isLoading: boolean;
  addToWatchlist: (productId: string) => Promise<void>;
  removeFromWatchlist: (productId: string) => Promise<void>;
  toggleWatchlist: (productId: string) => Promise<void>;
  isInWatchlist: (productId: string) => boolean;
  refreshWatchlist: () => Promise<void>;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

interface WatchlistProviderProps {
  children: React.ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [watchList, setWatchList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWatchlist = async () => {
    // Chỉ fetch khi user đã authenticated
    if (!isAuthenticated) {
      setWatchList([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.users.getWatchlist();

      if (response.success && response.data) {
        setWatchList(response.data.map((item: Product) => item.id));
      } else {
        logger.error("Failed to fetch watchlist");
      }
    } catch (error) {
      logger.error("Error fetching watchlist:", error);

      // Xử lý các loại lỗi khác nhau
      if (error instanceof Error) {
        toast.error("Có lỗi khi tải danh sách theo dõi");
        logger.error("Fetch watchlist error message:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWatchlist = async () => {
    if (isAuthenticated) {
      await fetchWatchlist();
    }
  };

  const clearWatchlist = () => {
    setWatchList([]);
    setIsLoading(false);
  };

  const addToWatchlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    // Optimistic update: thêm vào watchlist ngay lập tức
    const wasInWatchlist = watchList.includes(productId);
    if (!wasInWatchlist) {
      setWatchList((prev) => [...prev, productId]);
    }

    try {
      const response = await api.users.toggleWatchlist(productId);

      if (response.success && response.data?.inWatchlist) {
        toast.success("Đã thêm vào danh sách theo dõi");
        // State đã được cập nhật optimistically, không cần làm gì thêm
      } else {
        throw new Error(
          "API response indicates product not added to watchlist"
        );
      }
    } catch (error) {
      logger.error("Error adding to watchlist:", error);

      // Revert optimistic update nếu không thành công
      if (!wasInWatchlist) {
        setWatchList((prev) => prev.filter((id) => id !== productId));
      }

      toast.error("Có lỗi khi thêm vào danh sách theo dõi");
    }
  };

  const removeFromWatchlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    // Optimistic update: xóa khỏi watchlist ngay lập tức
    const wasInWatchlist = watchList.includes(productId);
    if (wasInWatchlist) {
      setWatchList((prev) => prev.filter((id) => id !== productId));
    }

    try {
      const response = await api.users.toggleWatchlist(productId);

      if (response.success && !response.data?.inWatchlist) {
        toast.success("Đã xóa khỏi danh sách theo dõi");
        // State đã được cập nhật optimistically, không cần làm gì thêm
      } else {
        throw new Error("API response indicates product still in watchlist");
      }
    } catch (error) {
      logger.error("Error removing from watchlist:", error);

      // Revert optimistic update nếu không thành công
      if (wasInWatchlist) {
        setWatchList((prev) =>
          prev.includes(productId) ? prev : [...prev, productId]
        );
      }

      toast.error("Có lỗi khi xóa khỏi danh sách theo dõi");
    }
  };

  const toggleWatchlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    // Optimistic update: cập nhật UI ngay lập tức
    const wasInWatchlist = watchList.includes(productId);
    const optimisticUpdate = !wasInWatchlist;

    // Cập nhật state ngay lập tức để UI phản hồi nhanh
    setWatchList((prev) => {
      if (optimisticUpdate) {
        // Thêm vào watchlist
        return prev.includes(productId) ? prev : [...prev, productId];
      } else {
        // Xóa khỏi watchlist
        return prev.filter((id) => id !== productId);
      }
    });

    try {
      const response = await api.users.toggleWatchlist(productId);

      if (response.success && response.data) {
        const actualResult = response.data.inWatchlist;

        // Kiểm tra xem kết quả có khớp với optimistic update không
        if (actualResult === optimisticUpdate) {
          // Success: hiển thị thông báo thành công
          const message = actualResult
            ? "Đã thêm vào danh sách theo dõi"
            : "Đã xóa khỏi danh sách theo dõi";
          toast.success(message);
        } else {
          // Server trả về kết quả khác với optimistic update, cần sync lại
          setWatchList((prev) => {
            if (actualResult) {
              return prev.includes(productId) ? prev : [...prev, productId];
            } else {
              return prev.filter((id) => id !== productId);
            }
          });
        }
      } else {
        throw new Error("API response indicates failure");
      }
    } catch (error) {
      logger.error("Error toggling watchlist:", error);

      // Revert optimistic update về trạng thái ban đầu
      setWatchList((prev) => {
        if (wasInWatchlist) {
          // Nếu ban đầu có trong watchlist, thêm lại
          return prev.includes(productId) ? prev : [...prev, productId];
        } else {
          // Nếu ban đầu không có, xóa đi
          return prev.filter((id) => id !== productId);
        }
      });

      toast.error("Có lỗi khi cập nhật danh sách theo dõi");
    }
  };

  const isInWatchlist = (productId: string): boolean => {
    if (!isAuthenticated || isLoading || authLoading) {
      return false;
    }

    const result = watchList.includes(productId);
    return result;
  };

  // Effect để sync với auth state
  useEffect(() => {
    if (authLoading) return; // Đợi auth loading xong

    if (isAuthenticated) {
      // User đã đăng nhập, fetch watchlist
      fetchWatchlist();
    } else {
      // User chưa đăng nhập hoặc đã logout, reset watchlist
      setWatchList([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchWatchlist]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup khi component unmount
      setWatchList([]);
      setIsLoading(false);
    };
  }, []);

  const contextValue: WatchlistContextType = {
    watchList,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    refreshWatchlist,
    clearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={contextValue}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
