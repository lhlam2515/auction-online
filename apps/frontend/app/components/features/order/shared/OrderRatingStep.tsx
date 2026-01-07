import type { OrderWithDetails, RatingWithUsers } from "@repo/shared-types";
import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { FeedbackCard } from "@/components/common/cards";
import { AlertSection } from "@/components/common/feedback";
import { RatingInfo } from "@/components/features/interaction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";

interface OrderRatingStepProps {
  order: OrderWithDetails;
  onSkip?: () => void;
  onSuccess?: () => void;
  isSeller?: boolean;
}

const OrderRatingStep = ({
  order,
  onSkip,
  onSuccess,
  isSeller = false,
}: OrderRatingStepProps) => {
  const { user } = useAuth();
  const [sentFeedback, setSentFeedback] = useState<RatingWithUsers | null>(
    null
  );
  const [receivedFeedback, setReceivedFeedback] =
    useState<RatingWithUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const otherParty = isSeller ? order.winner : order.seller;

  const fetchFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await api.orders.getFeedbacks(order.id);

      if (!result.success) {
        throw new Error(result.error.message || "Không thể tải đánh giá.");
      }

      const feedbacks = result.data;
      const [sent, received] = feedbacks.reduce<
        [RatingWithUsers | null, RatingWithUsers | null]
      >(
        (acc, feedback) => {
          if (feedback.senderId === user?.id) {
            acc[0] = feedback; // Sent feedback
          } else {
            acc[1] = feedback; // Received feedback
          }
          return acc;
        },
        [null, null]
      );

      setSentFeedback(sent);
      setReceivedFeedback(received);
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Đã xảy ra lỗi khi tải đánh giá."
      );
      showError(error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [order.id, user?.id]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmitSuccess = () => {
    fetchFeedbacks();
    onSuccess?.();
  };

  if (!otherParty) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Không thể đánh giá - thông tin{" "}
            {isSeller ? "người mua" : "người bán"} không khả dụng
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá {isSeller ? "người mua" : "người bán"}</CardTitle>
        <CardDescription>
          Trải nghiệm của bạn với {isSeller ? "người mua" : "người bán"}{" "}
          <strong>{otherParty.fullName}</strong> như thế nào?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="mr-1 h-4 w-4" />
            <span>Đang tải đánh giá...</span>
          </div>
        ) : (
          <>
            {/* Display received feedback if exists */}
            {receivedFeedback && (
              <FeedbackCard
                feedback={receivedFeedback}
                title={`Đánh giá từ ${isSeller ? "người mua" : "người bán"}`}
                isSent={false}
              />
            )}

            {/* Display sent feedback or rating form */}
            <RatingInfo
              orderId={order.id}
              feedback={sentFeedback}
              title={`Đánh giá của bạn cho ${isSeller ? "người mua" : "người bán"}`}
              isSent={true}
              isEditable={true}
              onSuccess={handleSubmitSuccess}
              onSkip={onSkip}
            />

            {/* Show message if feedback has been exchanged */}
            {sentFeedback && receivedFeedback && (
              <AlertSection
                variant="success"
                icon={Star}
                title="Hoàn thành đánh giá"
                description="Cả hai bên đã hoàn tất việc đánh giá. Cảm ơn bạn đã đóng góp xây dựng cộng đồng Online Auction!"
              />
            )}

            {/* Show message if only sent feedback exists */}
            {sentFeedback && !receivedFeedback && (
              <AlertSection
                variant="info"
                icon={Star}
                title="Chờ phản hồi"
                description={`Đang chờ ${isSeller ? "người mua" : "người bán"} gửi đánh giá.`}
              />
            )}

            {/* Show info alert if no feedback has been sent */}
            {!sentFeedback && (
              <AlertSection
                variant="info"
                icon={Star}
                title={`Đánh giá ${isSeller ? "người mua" : "người bán"}`}
                description={`Đánh giá của bạn sẽ giúp cộng đồng Online Auction xây dựng một môi trường mua bán tin cậy và minh bạch. Hãy trung thực và công bằng trong đánh giá của bạn.`}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderRatingStep;
