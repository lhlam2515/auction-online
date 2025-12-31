import type { OrderWithDetails } from "@repo/shared-types";
import { CheckCircle2, Truck, Star, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";

import {
  OrderStepper,
  OrderSummaryCard,
  RatingStep,
  type Step,
} from "@/components/features/order";
import {
  PaymentConfirmationStep,
  ShippingConfirmationStep,
} from "@/components/features/seller-order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SELLER_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chi tiết đơn hàng đã bán - Online Auction" },
    {
      name: "description",
      content:
        "Quản lý chi tiết đơn hàng đã bán trên Online Auction, xác nhận thanh toán, bàn giao hàng và đánh giá người mua.",
    },
  ];
}

export default function SellerOrderDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        toast.error("Không tìm thấy mã đơn hàng");
        navigate(SELLER_ROUTES.ORDERS);
        return;
      }

      try {
        setIsLoading(true);

        const orderResponse = await api.orders.getById(orderId);

        if (!orderResponse.success) {
          if (orderResponse.error.code === "FORBIDDEN") {
            throw new Error("Bạn không có quyền truy cập đơn hàng này");
          }

          throw new Error(
            orderResponse.error.message || "Không thể tải đơn hàng"
          );
        }

        const orderData = orderResponse.data;
        setOrder(orderData);

        // Determine current step based on order status for seller perspective
        // OrderStatus: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED"
        if (orderData.status === "PAID") {
          if (orderData.sellerConfirmedAt) {
            setCurrentStep(2); // Người bán đã xác nhận thanh toán, chờ bàn giao hàng
          } else {
            setCurrentStep(1); // Chờ người bán xác nhận thanh toán
          }
        } else if (orderData.status === "SHIPPED") {
          setCurrentStep(2); // Đơn hàng đã được gửi đi
        } else if (orderData.status === "COMPLETED") {
          setCurrentStep(3); // Đơn hàng hoàn thành, yêu cầu đánh giá
        } else {
          // PENDING hoặc CANCELLED, hiển thị bước 1
          setCurrentStep(1);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không thể tải đơn hàng"
        );
        navigate(SELLER_ROUTES.ORDERS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigate]);

  const steps: Step[] = [
    {
      number: 1,
      title: "Xác nhận thanh toán",
      icon: CheckCircle2,
      completed: currentStep > 1,
    },
    {
      number: 2,
      title: "Bàn giao hàng",
      icon: Truck,
      completed: currentStep > 2,
    },
    {
      number: 3,
      title: "Đánh giá người mua",
      icon: Star,
      completed: false,
    },
  ];

  // Callback handlers for component interactions
  const handlePaymentConfirmed = (updatedOrder: OrderWithDetails) => {
    setOrder(updatedOrder);
    setCurrentStep(2); // Chuyển sang Bàn giao hàng
  };

  const handleShippingSuccess = (updatedOrder: OrderWithDetails) => {
    setOrder(updatedOrder);
    setCurrentStep(3); // Chuyển sang Đánh giá
  };

  const handleRatingSuccess = () => {
    navigate(SELLER_ROUTES.DASHBOARD);
  };

  const handleSkipRating = () => {
    navigate(SELLER_ROUTES.DASHBOARD);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
        <span className="ml-2">Đang tải thông tin đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-600">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShoppingBag className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Chi tiết đơn hàng đã bán
              </CardTitle>
              <CardDescription className="text-lg">
                Mã đơn hàng: {order.orderNumber}
              </CardDescription>
            </div>
          </div>

          {/* Stepper */}
          <OrderStepper currentStep={currentStep} steps={steps} />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummaryCard order={order} isSeller={true} />
            </div>

            {/* Right Column - Step Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <PaymentConfirmationStep
                  order={order}
                  onSuccess={handlePaymentConfirmed}
                />
              )}

              {currentStep === 2 && (
                <ShippingConfirmationStep
                  order={order}
                  onSuccess={handleShippingSuccess}
                />
              )}

              {currentStep === 3 && (
                <RatingStep
                  order={order}
                  onSuccess={handleRatingSuccess}
                  onSkip={handleSkipRating}
                  isSeller={true}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
