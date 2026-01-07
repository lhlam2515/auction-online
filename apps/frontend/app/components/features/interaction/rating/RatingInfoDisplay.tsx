import type { RatingWithUsers } from "@repo/shared-types";
import { Edit2, Edit3, Star } from "lucide-react";
import React from "react";
import type { z } from "zod";

import { AlertSection } from "@/components/common/feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-layer";
import { submitFeedbackSchema } from "@/lib/validations/order.validation";

import RatingCard from "./RatingCard";
import RatingForm from "./RatingForm";

type RatingInfoDisplayProps = {
  orderId: string;
  feedback: RatingWithUsers | null;
  title: string;
  isSent: boolean;
  isEditable?: boolean;
  onSuccess?: () => void;
  onSkip?: () => void;
};

const RatingInfoDisplay = ({
  orderId,
  feedback,
  title,
  isSent,
  isEditable = true,
  onSuccess,
  onSkip,
}: RatingInfoDisplayProps) => {
  const [feedbackState, setFeedbackState] =
    React.useState<RatingWithUsers | null>(feedback);
  const [isEditing, setIsEditing] = React.useState(!feedback);

  React.useEffect(() => {
    setFeedbackState(feedback);
    setIsEditing(!feedback);
  }, [feedback]);

  const handleSuccess = () => {
    setIsEditing(false);
    onSuccess?.();
  };

  const handleSubmit = async (data: z.infer<typeof submitFeedbackSchema>) => {
    if (feedbackState) {
      return api.orders.updateFeedback(orderId, data);
    } else {
      return api.orders.submitFeedback(orderId, data);
    }
  };

  const handleCancel = () => {
    if (feedbackState) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {feedbackState && (
          <Label className="text-base font-semibold">{title}</Label>
        )}
        {isEditable && feedbackState && !isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-1 h-4 w-4" />
            Chỉnh sửa
          </Button>
        ) : isEditing && feedbackState ? (
          <div className="flex items-center gap-2">
            <Edit3 className="mr-1 h-4 w-4" /> Đang chỉnh sửa
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <>
          {feedbackState && (
            <AlertSection
              variant="info"
              icon={Star}
              title="Chỉnh sửa đánh giá"
              description="Bạn có thể cập nhật đánh giá của mình. Thay đổi sẽ được lưu sau khi bạn gửi lại."
              className="mb-4"
            />
          )}
          <RatingForm
            schema={submitFeedbackSchema}
            defaultValues={{
              rating: feedbackState?.score || 0,
              comment: feedbackState?.comment || "",
            }}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            onSkip={feedbackState ? handleCancel : onSkip}
            onCancel={handleCancel}
            isEditing={!!feedbackState}
          />
        </>
      ) : feedbackState ? (
        <RatingCard rating={feedbackState} title={title} isSent={isSent} />
      ) : (
        <AlertSection
          variant="warning"
          title="Chưa có đánh giá"
          description="Vui lòng gửi đánh giá của bạn để hoàn tất đơn hàng."
        />
      )}
    </div>
  );
};

export default RatingInfoDisplay;
