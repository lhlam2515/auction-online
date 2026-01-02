import type { OrderWithDetails } from "@repo/shared-types";
import { Star } from "lucide-react";

import AlertSection from "@/components/common/AlertSection";
import RatingForm from "@/components/features/interaction/RatingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { submitFeedbackSchema } from "@/lib/validations/order.validation";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá {isSeller ? "người mua" : "người bán"}</CardTitle>
        <CardDescription>
          Trải nghiệm của bạn với {isSeller ? "người mua" : "người bán"}{" "}
          <strong>
            {isSeller ? order.winner.fullName : order.seller.fullName}
          </strong>{" "}
          như thế nào?
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Info Alert */}
        <AlertSection
          variant="info"
          icon={Star}
          title={`Đánh giá ${isSeller ? "người mua" : "người bán"}`}
          description={`Đánh giá của bạn sẽ giúp cộng đồng Online Auction xây dựng một môi trường mua bán tin cậy và minh bạch. Hãy trung thực và công bằng trong đánh giá của bạn.`}
        />

        <RatingForm
          schema={submitFeedbackSchema}
          defaultValues={{
            rating: 0,
            comment: "",
          }}
          onSubmit={api.orders.submitFeedback.bind(null, order.id)}
          onSuccess={onSuccess}
          onSkip={onSkip}
        />
      </CardContent>
    </Card>
  );
};

export default OrderRatingStep;
