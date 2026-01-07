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
import { answerQuestionSchema } from "@/lib/validations/question.validation";

interface AnswerFormProps {
  questionId: string;
  onSubmit: (
    questionId: string,
    data: z.infer<typeof answerQuestionSchema>
  ) => Promise<void>;
}

const AnswerForm = ({ questionId, onSubmit }: AnswerFormProps) => {
  const answerForm = useForm<z.infer<typeof answerQuestionSchema>>({
    resolver: zodResolver(answerQuestionSchema),
    defaultValues: {
      answerContent: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof answerQuestionSchema>) => {
    await onSubmit(questionId, data);
    answerForm.reset();
  };

  return (
    <form onSubmit={answerForm.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="answerContent"
          control={answerForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Trả lời câu hỏi</FieldLabel>
              <div className="flex gap-2">
                <Textarea
                  {...field}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="min-h-20 resize-none"
                  aria-invalid={fieldState.invalid}
                  disabled={answerForm.formState.isSubmitting}
                />
                <Button
                  type="submit"
                  disabled={
                    !field.value?.trim() || answerForm.formState.isSubmitting
                  }
                  className="self-end bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700"
                  size="icon"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <FieldDescription>
                Câu trả lời của bạn sẽ được hiển thị công khai
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
};

export default AnswerForm;
