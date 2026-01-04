import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoFieldsProps<T extends FieldValues> {
  control: Control<T>;
  categories: Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;
}

const BasicInfoFields = <T extends FieldValues>({
  control,
  categories,
}: BasicInfoFieldsProps<T>) => {
  const renderCategoryOptions = () => {
    return categories.map((parentCategory) => (
      <SelectGroup key={parentCategory.id}>
        <SelectLabel>{parentCategory.name}</SelectLabel>
        {parentCategory.children?.map((childCategory) => (
          <SelectItem key={childCategory.id} value={childCategory.id}>
            {childCategory.name}
          </SelectItem>
        ))}
      </SelectGroup>
    ));
  };

  return (
    <FieldGroup className="gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Controller
          control={control}
          name={"name" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Tên sản phẩm <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="Nhập tên sản phẩm"
                className="min-h-12 border text-base"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name={"categoryId" as Path<T>}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-base font-semibold"
              >
                Danh mục <span className="text-red-500">*</span>
              </FieldLabel>
              <Select
                {...field}
                onValueChange={field.onChange}
                defaultValue={field.value as string}
              >
                <SelectTrigger
                  id={field.name}
                  className="min-h-12 cursor-pointer"
                >
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>{renderCategoryOptions()}</SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        control={control}
        name={"description" as Path<T>}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="flex flex-col gap-2"
          >
            <FieldLabel
              htmlFor={field.name}
              className="text-base font-semibold"
            >
              Mô tả sản phẩm <span className="text-red-500">*</span>
            </FieldLabel>
            <RichTextEditor
              content={field.value as string}
              onChange={field.onChange}
              placeholder="Mô tả chi tiết về sản phẩm: tình trạng, xuất xứ, đặc điểm nổi bật..."
              className="min-h-[200px]"
            />
            <FieldDescription>
              Mô tả chi tiết giúp người mua hiểu rõ hơn về sản phẩm. Mô tả có
              thể bổ sung thêm sau khi tạo sản phẩm.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
};

export default BasicInfoFields;
