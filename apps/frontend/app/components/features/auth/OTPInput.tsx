import React from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

type OTPInputProps = Omit<
  React.ComponentProps<typeof InputOTP>,
  "render" | "children"
> & {
  maxLength?: number;
};

/**
 * OTP Input Component
 * Reusable component for OTP verification with 6-digit input
 */
const OTPInput = ({
  id,
  value,
  maxLength = 6,
  className,
  onChange,
  ...props
}: OTPInputProps) => {
  const handleOnChange = (newValue: string) => {
    // Remove non-numeric characters and truncate to maxLength
    const sanitizedValue = newValue.replace(/[^0-9]/g, "").slice(0, maxLength);

    // Call onChange only if the sanitized value is different
    if (sanitizedValue !== value) {
      onChange?.(sanitizedValue);
    }
  };

  return (
    <InputOTP
      id={id}
      value={value}
      maxLength={maxLength}
      onChange={handleOnChange}
      className={cn("w-full", className)}
      {...props}
    >
      <InputOTPGroup className="w-full justify-center gap-3">
        {Array.from({ length: maxLength }).map((_, idx) => (
          <InputOTPSlot
            key={idx}
            index={idx}
            className="rounded-lg p-8 text-3xl font-semibold transition-none"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
};

export default OTPInput;
