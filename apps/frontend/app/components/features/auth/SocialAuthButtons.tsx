import { Separator } from "@/components/ui/separator";

import OAuthButton from "./OAuthButton";

interface SocialAuthButtonsProps {
  disabled?: boolean;
}

const SocialAuthButtons = ({ disabled }: SocialAuthButtonsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-sm">Hoặc tiếp tục với</span>
        <Separator className="flex-1" />
      </div>

      <div className="flex flex-col gap-3">
        <OAuthButton provider="google" disabled={disabled} />
        <OAuthButton provider="facebook" disabled={disabled} />
      </div>
    </div>
  );
};

export default SocialAuthButtons;
