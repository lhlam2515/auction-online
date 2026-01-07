import type { ProductQuestionWithUsers } from "@repo/shared-types";
import { Loader2, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { UserAvatar } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-layer";
import { getErrorMessage, showError } from "@/lib/handlers/error";
import { formatDate } from "@/lib/utils";
import {
  askQuestionSchema,
  answerQuestionSchema,
} from "@/lib/validations/question.validation";

import AnswerForm from "./forms/AnswerForm";
import AskForm from "./forms/AskForm";

interface ProductQnAProps {
  productId: string;
  isLoggedIn: boolean;
  isSeller: boolean;
  isEnded: boolean;
  className?: string;
}

const ProductQnA = ({
  productId,
  isLoggedIn,
  isSeller,
  isEnded,
  className,
}: ProductQnAProps) => {
  const [questions, setQuestions] = useState<ProductQuestionWithUsers[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(
    async (isMounted: boolean) => {
      if (!productId) return;
      try {
        setLoading(true);
        const response = await api.questions.getPublic(productId);

        if (isMounted) {
          if (response.success && response.data) {
            setQuestions(response.data);
          } else {
            throw new Error("Có lỗi khi tải câu hỏi");
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = getErrorMessage(error, "Có lỗi khi tải câu hỏi");
          showError(error, errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    },
    [productId]
  );

  useEffect(() => {
    let isMounted = true;

    fetchQuestions(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchQuestions, productId]);

  const handleQuestionSubmit = async (
    data: z.infer<typeof askQuestionSchema>
  ) => {
    try {
      const response = await api.questions.ask(productId!, {
        questionContent: data.questionContent,
      });
      if (response.success) {
        toast.success("Đã gửi câu hỏi thành công");
        await fetchQuestions(true);
      } else {
        throw new Error("Không thể gửi câu hỏi");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Có lỗi khi gửi câu hỏi");
      showError(error, errorMessage);
    }
  };

  const handleAnswerSubmit = async (
    questionId: string,
    data: z.infer<typeof answerQuestionSchema>
  ) => {
    try {
      const response = await api.questions.answer(questionId, {
        answerContent: data.answerContent,
      });
      if (response.success) {
        toast.success("Đã gửi câu trả lời thành công");
        await fetchQuestions(true);
      } else {
        throw new Error("Có lỗi khi gửi câu trả lời");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Có lỗi khi gửi câu trả lời");
      showError(error, errorMessage);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-5 text-2xl">
          <MessageCircle className="text-muted-foreground h-5 w-5" />
          Hỏi đáp
          <span className="text-muted-foreground text-sm">
            ({questions.length} câu hỏi)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Question Input - Only for logged in buyers when auction is not ended */}
        {isLoggedIn && !isSeller && !isEnded && (
          <div className="bg-primary/5 mb-6 rounded-lg p-4">
            <AskForm onSubmit={handleQuestionSubmit} />
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-muted-foreground text-center">
              <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin" />
              Đang tải câu hỏi...
            </p>
          ) : questions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Chưa có câu hỏi nào</p>
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className="border-b pb-6 last:border-b-0 last:pb-0"
              >
                {/* Question */}
                <div className="mb-3 flex gap-3">
                  <UserAvatar name={q.userName} imageUrl={q.userAvatarUrl} />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-foreground font-semibold">
                        {q.userName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-sm">{q.questionContent}</p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {q.answerContent && (
                  <div className="mt-3 ml-12 flex gap-3">
                    <UserAvatar
                      name={q.answererName!}
                      imageUrl={q.answererAvatarUrl!}
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-foreground font-semibold">
                          {q.answererName!}
                        </span>
                        <Badge variant="default" className="bg-green-600">
                          Người bán
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(q.answeredAt!)}
                        </span>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                        <p className="text-sm">{q.answerContent}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Awaiting answer */}
                {!q.answerContent && !isSeller && (
                  <div className="mt-3 ml-12">
                    <p className="text-muted-foreground text-xs italic">
                      Đang chờ người bán trả lời...
                    </p>
                  </div>
                )}

                {/* Answer Form - Only for seller if not answered yet */}
                {!q.answerContent && isSeller && (
                  <div className="mt-3 ml-12">
                    <div className="mb-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <AnswerForm
                        questionId={q.id}
                        onSubmit={handleAnswerSubmit}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductQnA;
