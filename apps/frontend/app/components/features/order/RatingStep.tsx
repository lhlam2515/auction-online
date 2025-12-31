import type { OrderWithDetails } from "@repo/shared-types";
import { Star } from "lucide-react";

import RatingForm from "@/components/features/interaction/RatingForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { submitFeedbackSchema } from "@/lib/validations/order.validation";

interface RatingStepProps {
  order: OrderWithDetails;
  onSkip?: () => void;
  onSuccess?: () => void;
  isSeller?: boolean;
}

export function RatingStep({
  order,
  onSkip,
  onSuccess,
  isSeller = false,
}: RatingStepProps) {
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
        <Alert className="border-blue-300 bg-blue-50 text-blue-600">
          <Star className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-semibold">
            Đánh giá {isSeller ? "người mua" : "người bán"}
          </AlertTitle>
          <AlertDescription className="text-blue-600">
            Đánh giá của bạn sẽ giúp cộng đồng Online Auction xây dựng một môi
            trường mua bán tin cậy và minh bạch. Hãy trung thực và công bằng
            trong đánh giá của bạn.
          </AlertDescription>
        </Alert>

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
}
