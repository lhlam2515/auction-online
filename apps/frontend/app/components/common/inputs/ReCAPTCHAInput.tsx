// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from "react-google-recaptcha";

interface ReCAPTCHAInputProps {
  value?: string;
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  className?: string;
}

/**
 * ReCAPTCHA Input Component
 * Wrapper component for Google ReCAPTCHA v2
 */
const ReCAPTCHAInput = ({
  onChange,
  onExpired,
  className,
}: ReCAPTCHAInputProps) => {
  const siteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY;

  if (typeof siteKey !== "string" || !siteKey) {
    return (
      <div className="error-message">
        Error: VITE_CAPTCHA_SITE_KEY environment variable is not set.
      </div>
    );
  }

  return (
    <ReCAPTCHA
      sitekey={siteKey}
      onChange={onChange}
      onExpired={onExpired}
      className={className}
    />
  );
};

export default ReCAPTCHAInput;
