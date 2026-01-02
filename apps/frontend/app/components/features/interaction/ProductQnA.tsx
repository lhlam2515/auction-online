import type { ProductQuestionWithUsers } from "@repo/shared-types";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-layer";
import logger from "@/lib/logger";
import { formatDate } from "@/lib/utils";

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

  const [questionInput, setQuestionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [answeringQuestions, setAnsweringQuestions] = useState<
    Record<string, boolean>
  >({});

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
            toast.error("Không thể tải câu hỏi");
          }
        }
      } catch (err) {
        if (isMounted) {
          toast.error("Có lỗi khi tải câu hỏi");
          logger.error("Failed to fetch questions:", err);
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

  const handleQuestionSubmit = async () => {
    if (!questionInput.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.questions.ask(productId!, {
        questionContent: questionInput,
      });
      setQuestionInput("");
      toast.success("Đã gửi câu hỏi thành công");
      await fetchQuestions(true);
    } catch (err) {
      toast.error("Có lỗi khi gửi câu hỏi");
      logger.error("Failed to submit question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    const answerContent = answerInputs[questionId];
    if (!answerContent?.trim()) return;

    try {
      setAnsweringQuestions((prev) => ({ ...prev, [questionId]: true }));
      const response = await api.questions.answer(questionId, {
        answerContent: answerContent,
      });
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
      toast.success("Đã gửi câu trả lời thành công");
      await fetchQuestions(true);
    } catch (err) {
      toast.error("Có lỗi khi gửi câu trả lời");
      logger.error("Failed to submit answer:", err);
    } finally {
      setAnsweringQuestions((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const updateAnswerInput = (questionId: string, value: string) => {
    setAnswerInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-5 text-2xl">
          <MessageCircle className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          Hỏi đáp
          <span className="text-muted-foreground text-sm">
            ({questions.length} câu hỏi)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Question Input - Only for logged in buyers when auction is not ended */}
        {isLoggedIn && !isSeller && !isEnded && (
          <div className="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Đặt câu hỏi cho người bán
            </label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Nhập câu hỏi của bạn về sản phẩm này..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                className="min-h-20 resize-none"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleQuestionSubmit}
                disabled={!questionInput.trim() || isSubmitting}
                className="cursor-pointer self-end bg-slate-900 text-white hover:bg-slate-800"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Câu hỏi của bạn sẽ được người bán trả lời sớm nhất có thể
            </p>
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
                  <Avatar className="h-10 w-10 shrink-0 bg-blue-100 dark:bg-blue-900">
                    <div className="flex h-full w-full items-center justify-center font-semibold text-blue-600 select-none dark:text-blue-300">
                      {q.userName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {q.userName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {q.questionContent}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {q.answerContent && (
                  <div className="mt-3 ml-8 flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0 bg-green-100 dark:bg-green-900">
                      <div className="flex h-full w-full items-center justify-center font-semibold text-green-600 select-none dark:text-green-300">
                        {q.answererName!.charAt(0).toUpperCase()}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {q.answererName!}
                        </span>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Người bán
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(q.answeredAt!)}
                        </span>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {q.answerContent}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Awaiting answer */}
                {!q.answerContent && !isSeller && (
                  <div className="mt-3 ml-8">
                    <p className="text-muted-foreground text-xs italic">
                      Đang chờ người bán trả lời...
                    </p>
                  </div>
                )}

                {!q.answerContent && isSeller && (
                  <div className="mt-3 ml-8">
                    <div className="mb-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <label className="mb-2 block text-sm font-medium text-green-700 dark:text-green-300">
                        Trả lời câu hỏi
                      </label>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Nhập câu trả lời của bạn..."
                          value={answerInputs[q.id] || ""}
                          onChange={(e) =>
                            updateAnswerInput(q.id, e.target.value)
                          }
                          className="min-h-20 resize-none"
                          disabled={answeringQuestions[q.id]}
                        />
                        <Button
                          onClick={() => handleAnswerSubmit(q.id)}
                          disabled={
                            !answerInputs[q.id]?.trim() ||
                            answeringQuestions[q.id]
                          }
                          className="cursor-pointer self-end bg-green-600 text-white hover:bg-green-700"
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                        Câu trả lời của bạn sẽ được hiển thị công khai
                      </p>
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
