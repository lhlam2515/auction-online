import type { OrderWithDetails } from "@repo/shared-types";

import RatingForm from "@/components/features/interaction/RatingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { submitFeedbackSchema } from "@/lib/validations/user.validation";

interface RatingStepProps {
  order: OrderWithDetails;
  onSkip?: () => void;
  onSuccess?: () => void;
}

export function RatingStep({ order, onSkip, onSuccess }: RatingStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá người bán</CardTitle>
        <CardDescription>
          Trải nghiệm của bạn với người bán{" "}
          <strong>{order.seller.fullName}</strong> như thế nào?
        </CardDescription>
      </CardHeader>
      <CardContent>
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
