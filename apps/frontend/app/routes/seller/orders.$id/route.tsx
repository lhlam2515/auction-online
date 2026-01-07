import type { OrderWithDetails } from "@repo/shared-types";
import { CheckCircle2, Truck, Star, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";

import { OrderStatusBadge } from "@/components/common/badges";
import {
  SellerPaymentStep,
  SellerShippingStep,
} from "@/components/features/order/seller";
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
        if (orderData.status === "CANCELLED") {
          setCurrentStep(0); // Đơn hàng đã hủy, không có bước tiếp theo
        } else if (orderData.status === "PENDING") {
          setCurrentStep(1); // Chờ người mua thanh toán
        } else if (orderData.status === "PAID") {
          if (orderData.sellerConfirmedAt) {
            setCurrentStep(2); // Người bán đã xác nhận thanh toán, chờ bàn giao hàng
          } else {
            setCurrentStep(1); // Chờ người bán xác nhận thanh toán
          }
        } else if (orderData.status === "SHIPPED") {
          setCurrentStep(2); // Đơn hàng đã được gửi đi
        } else if (orderData.status === "COMPLETED") {
          setCurrentStep(3); // Đơn hàng hoàn thành, yêu cầu đánh giá
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

    if (updatedOrder.status === "CANCELLED") {
      setCurrentStep(0);
    } else if (updatedOrder.sellerConfirmedAt) {
      setCurrentStep(2); // Chuyển sang Bàn giao hàng
    }
  };

  const handleShippingSuccess = (updatedOrder: OrderWithDetails) => {
    setOrder(updatedOrder);
    setCurrentStep(2); // Giữ nguyên bước hiện tại để hiển thị trạng thái thành công
  };

  const handleRatingSuccess = () => {
    // Giữ nguyên trên trang chi tiết đơn hàng sau khi đánh giá thành công
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
        <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
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
                <CardTitle className="text-2xl">
                  Chi tiết đơn hàng đã bán
                </CardTitle>
                <CardDescription className="text-lg">
                  Mã đơn hàng: {order.orderNumber}
                </CardDescription>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
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
              <OrderSummaryCard order={order} isSeller={true} />
            </div>

            {/* Right Column - Step Content */}
            <div className="lg:col-span-2">
              {currentStep === 0 && (
                <OrderCancelledCard order={order} isSeller={true} />
              )}

              {currentStep === 1 && (
                <SellerPaymentStep
                  order={order}
                  onSuccess={handlePaymentConfirmed}
                />
              )}

              {currentStep === 2 && (
                <SellerShippingStep
                  order={order}
                  onSuccess={handleShippingSuccess}
                />
              )}

              {currentStep === 3 && (
                <OrderRatingStep
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
