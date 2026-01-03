import type { AdminUser } from "@repo/shared-types";
import { useState, useEffect, useCallback } from "react";

import { api } from "@/lib/api-layer";

type UseUserDetailsProps = {
  userId: string;
  enabled?: boolean;
};

export const useUserDetails = ({
  userId,
  enabled = true,
}: UseUserDetailsProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserDetails = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError("");
      const response = await api.admin.users.getById(userId);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải thông tin");
    } finally {
      setLoading(false);
    }
  }, [userId, enabled]);

  useEffect(() => {
    if (enabled && userId) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, enabled, userId]);

  return {
    user,
    loading,
    error,
    refetch: fetchUserDetails,
  };
};
