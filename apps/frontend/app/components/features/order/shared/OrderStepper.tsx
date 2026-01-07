import { CheckCircle2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Step {
  number: number;
  title: string;
  icon: LucideIcon;
  completed: boolean;
}

interface OrderStepperProps {
  currentStep: number;
  steps: Step[];
}

const OrderStepper = ({ currentStep, steps }: OrderStepperProps) => {
  // Tính toán progress dựa trên số steps đã completed
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage =
    (completedSteps / steps.length) * 100 + (1 / steps.length) * 50;

  return (
    <div className="relative mb-6 flex items-center justify-between">
      {/* Progress Line */}
      <div className="bg-muted absolute top-5 right-0 left-0 z-0 h-1">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>

      {steps.map((step) => {
        const Icon = step.icon;
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep || step.completed;

        return (
          <div
            key={step.number}
            className="z-1 flex flex-1 flex-col items-center"
          >
            <div
              className={cn(
                "mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <p
              className={cn(
                "inline-block text-center text-base font-medium",
                isActive || isCompleted
                  ? "text-card-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.title}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStepper;
