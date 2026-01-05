import type { OrderWithDetails } from "@repo/shared-types";
import { Package, Star, ShoppingBag, Truck, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";

import { OrderStatusBadge } from "@/components/common/badges";
import {
  BuyerPaymentStep,
  BuyerAwaitingStep,
  BuyerShippingStep,
} from "@/components/features/order/buyer";
import {
  type Step,
  OrderStepper,
  OrderSummaryCard,
  OrderCancelledCard,
  OrderRatingStep,
} from "@/components/features/order/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ACCOUNT_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api-layer";

import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chi tiết đơn hàng - Online Auction" },
    {
      name: "description",
      content:
        "Xem chi tiết đơn hàng của bạn trên Online Auction, bao gồm trạng thái thanh toán, vận chuyển và đánh giá người bán.",
    },
  ];
}

export default function OrderDetailPage() {
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
        navigate(ACCOUNT_ROUTES.BIDS);
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

        // Determine current step based on order status and seller confirmation
        // OrderStatus: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED"
        if (orderData.status === "CANCELLED") {
          setCurrentStep(0); // Đơn hàng đã hủy
        } else if (orderData.status === "PENDING") {
          setCurrentStep(1); // Chưa thanh toán
        } else if (orderData.status === "PAID") {
          setCurrentStep(2); // Đã thanh toán, chờ người bán xác nhận và chuẩn bị hàng
        } else if (orderData.status === "SHIPPED") {
          setCurrentStep(3); // Người bán đã bàn giao, đang giao hàng
        } else if (orderData.status === "COMPLETED") {
          setCurrentStep(4); // Đã hoàn thành, yêu cầu đánh giá
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không thể tải đơn hàng"
        );
        navigate(ACCOUNT_ROUTES.BIDS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigate]);

  const steps: Step[] = [
    {
      number: 1,
      title: "Thanh toán",
      icon: Package,
      completed: currentStep > 1,
    },
    {
      number: 2,
      title: "Chờ xác nhận",
      icon: Clock,
      completed: currentStep > 2,
    },
    {
      number: 3,
      title: "Đang giao hàng",
      icon: Truck,
      completed: currentStep > 3,
    },
    {
      number: 4,
      title: "Đánh giá",
      icon: Star,
      completed: false,
    },
  ];

  // Callback handlers for component interactions
  const handlePaymentSuccess = (updatedOrder: OrderWithDetails) => {
    setOrder(updatedOrder);
    setCurrentStep(2); // Chuyển sang Chờ xác nhận
  };

  const handleShippingSuccess = (updatedOrder: OrderWithDetails) => {
    setOrder(updatedOrder);
    setCurrentStep(4); // Chuyển sang Đánh giá
  };

  const handleRatingSuccess = () => {
    navigate(ACCOUNT_ROUTES.DASHBOARD);
  };

  const handleSkipRating = () => {
    navigate(ACCOUNT_ROUTES.DASHBOARD);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <ShoppingBag className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Chi tiết đơn hàng</CardTitle>
                <CardDescription className="text-lg">
                  Mã đơn hàng: {order.orderNumber}
                </CardDescription>
              </div>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>

          {/* Stepper */}
          {currentStep !== 0 && (
            <OrderStepper currentStep={currentStep} steps={steps} />
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummaryCard order={order} />
            </div>

            {/* Right Column - Step Content */}
            <div className="lg:col-span-2">
              {currentStep === 0 && <OrderCancelledCard order={order} />}

              {currentStep === 1 && (
                <BuyerPaymentStep
                  order={order}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {currentStep === 2 && <BuyerAwaitingStep order={order} />}

              {currentStep === 3 && (
                <BuyerShippingStep
                  order={order}
                  onSuccess={handleShippingSuccess}
                />
              )}

              {currentStep === 4 && (
                <OrderRatingStep
                  order={order}
                  onSkip={handleSkipRating}
                  onSuccess={handleRatingSuccess}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
