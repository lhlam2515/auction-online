import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserFormFieldsProps<T extends FieldValues> {
  defaultValues: T;
  isSubmitting: boolean;
}

const CreateUserFormFields = <T extends FieldValues>({
  defaultValues,
  isSubmitting,
}: CreateUserFormFieldsProps<T>) => {
  const { control } = useFormContext<T>();
  const [showPassword, setShowPassword] = useState(false);

  const formatFieldName = (fieldName: string): string => {
    const nameMap: Record<string, string> = {
      email: "Email",
      username: "Username",
      fullName: "Họ và tên",
      password: "Mật khẩu",
      role: "Vai trò",
      address: "Địa chỉ",
      birthDate: "Ngày sinh",
    };

    return (
      nameMap[fieldName] ||
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );
  };

  const getInputType = (fieldName: string): string => {
    if (fieldName === "password") return showPassword ? "text" : "password";
    if (fieldName === "email") return "email";
    if (fieldName === "birthDate") return "date";
    return "text";
  };

  const getPlaceholder = (fieldName: string): string => {
    const placeholderMap: Record<string, string> = {
      email: "user@example.com",
      username: "username123",
      fullName: "Nguyễn Văn A",
      password: "••••••••",
      address: "123 Đường ABC, Quận XYZ, TP.HCM",
    };

    return placeholderMap[fieldName] || "";
  };

  const isRequired = (fieldName: string): boolean => {
    return ["email", "username", "fullName", "password"].includes(fieldName);
  };

  const renderRoleField = (fieldName: string) => (
    <Controller
      key={fieldName}
      control={control}
      name={fieldName as Path<T>}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>{formatFieldName(field.name)}</FieldLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BIDDER">Bidder</SelectItem>
              <SelectItem value="SELLER">Seller</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );

  const renderPasswordField = (fieldName: string) => (
    <Controller
      key={fieldName}
      control={control}
      name={fieldName as Path<T>}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>
            {formatFieldName(field.name)}{" "}
            {isRequired(field.name) && (
              <span className="text-destructive">*</span>
            )}
          </FieldLabel>
          <div className="relative">
            <Input
              {...field}
              id={field.name}
              type={getInputType(field.name)}
              placeholder={getPlaceholder(field.name)}
              disabled={isSubmitting}
              className="pr-10"
              required={isRequired(field.name)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );

  const renderField = (fieldName: string) => {
    if (fieldName === "role") {
      return renderRoleField(fieldName);
    }

    if (fieldName === "password") {
      return renderPasswordField(fieldName);
    }

    return (
      <Controller
        key={fieldName}
        control={control}
        name={fieldName as Path<T>}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>
              {formatFieldName(field.name)}{" "}
              {isRequired(field.name) && (
                <span className="text-destructive">*</span>
              )}
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type={getInputType(field.name)}
              placeholder={getPlaceholder(field.name)}
              disabled={isSubmitting}
              value={field.value || ""}
              required={isRequired(field.name)}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />
    );
  };

  const gridFields = [
    "email",
    "username",
    "fullName",
    "password",
    "role",
    "birthDate",
  ];
  const fullWidthFields = ["address"];

  return (
    <FieldGroup className="gap-4">
      {/* Grid layout for main fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.keys(defaultValues)
          .filter((field) => gridFields.includes(field))
          .map((field) => renderField(field))}
      </div>

      {/* Full width fields */}
      {Object.keys(defaultValues)
        .filter((field) => fullWidthFields.includes(field))
        .map((field) => renderField(field))}
    </FieldGroup>
  );
};

export default CreateUserFormFields;
