// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from "react-google-recaptcha";
import {
  Controller,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/constants/routes";

interface AuthFormFieldsProps<T extends FieldValues> {
  defaultValues: T;
  formType: "LOGIN" | "REGISTER";
}

const AuthFormFields = <T extends FieldValues>({
  defaultValues,
  formType,
}: AuthFormFieldsProps<T>) => {
  const { control } = useFormContext<T>();

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      fullName: "Họ và Tên",
      email: "Địa chỉ Email",
      address: "Địa chỉ",
      password: "Mật khẩu",
      confirmPassword: "Xác nhận Mật khẩu",
    };

    return (
      nameMap[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  };

  const getInputType = (fieldName: string): string => {
    if (fieldName.toLowerCase().includes("password")) return "password";
    if (fieldName.toLowerCase().includes("email")) return "email";
    return "text";
  };

  const renderField = (
    fieldName: string,
    className: string = "flex w-full flex-col gap-2"
  ) => (
    <Controller
      key={fieldName}
      control={control}
      name={fieldName as Path<T>}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name} className="text-base font-semibold">
            {formatFieldName(field.name)}
          </FieldLabel>
          <Input
            {...field}
            id={field.name}
            type={getInputType(field.name)}
            className="min-h-12 border text-base"
            aria-invalid={fieldState.invalid}
            autoComplete={
              field.name.includes("password") ? "current-password" : "off"
            }
            required
          />
          {formType === "LOGIN" && field.name === "password" ? (
            <div className="flex items-center">
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <Button variant="link" asChild className="ml-auto h-min p-0">
                <Link to={AUTH_ROUTES.FORGOT_PASSWORD}>Quên mật khẩu?</Link>
              </Button>
            </div>
          ) : (
            <>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </>
          )}
        </Field>
      )}
    />
  );

  return (
    <FieldGroup className="gap-4">
      {formType === "REGISTER" && (
        <div className="flex w-full gap-4">
          {["fullName", "email"].map((fieldName) => {
            if (!(fieldName in defaultValues)) return null;
            return renderField(fieldName, "flex flex-1 flex-col gap-2");
          })}
        </div>
      )}

      {Object.keys(defaultValues)
        .filter(
          (field) =>
            !(
              formType === "REGISTER" && ["fullName", "email"].includes(field)
            ) && field !== "recaptchaToken"
        )
        .map((field) => renderField(field))}

      <Controller
        control={control}
        name={"recaptchaToken" as Path<T>}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="flex w-full flex-col gap-2"
          >
            {typeof import.meta.env.VITE_CAPTCHA_SITE_KEY !== "string" ||
            !import.meta.env.VITE_CAPTCHA_SITE_KEY ? (
              <div className="error-message">
                Error: VITE_CAPTCHA_SITE_KEY environment variable is not set.
              </div>
            ) : (
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_CAPTCHA_SITE_KEY}
                onChange={(token) => field.onChange(token)}
                onExpired={() => field.onChange("")}
              />
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
};

export default AuthFormFields;
