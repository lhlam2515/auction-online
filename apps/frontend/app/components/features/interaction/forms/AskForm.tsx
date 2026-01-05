import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { askQuestionSchema } from "@/lib/validations/question.validation";

interface AskFormProps {
  onSubmit: (data: z.infer<typeof askQuestionSchema>) => Promise<void>;
}

const AskForm = ({ onSubmit }: AskFormProps) => {
  const questionForm = useForm<z.infer<typeof askQuestionSchema>>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      questionContent: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof askQuestionSchema>) => {
    await onSubmit(data);
    questionForm.reset();
  };

  return (
    <form onSubmit={questionForm.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="questionContent"
          control={questionForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Đặt câu hỏi cho người bán
              </FieldLabel>
              <div className="flex gap-2">
                <Textarea
                  {...field}
                  placeholder="Nhập câu hỏi của bạn về sản phẩm này..."
                  className="min-h-20 resize-none"
                  aria-invalid={fieldState.invalid}
                  disabled={questionForm.formState.isSubmitting}
                />
                <Button
                  type="submit"
                  disabled={
                    !field.value?.trim() || questionForm.formState.isSubmitting
                  }
                  className="cursor-pointer self-end"
                  size="icon"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <FieldDescription>
                Câu hỏi của bạn sẽ được người bán trả lời sớm nhất có thể
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
};

export default AskForm;
