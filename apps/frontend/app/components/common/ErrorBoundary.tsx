import React, { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: {
    userId?: string;
    componentName?: string;
    [key: string]: unknown;
  };
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store error info in state for display
    this.setState({ errorInfo });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("React Error Boundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <Card className="border-destructive/50 w-full max-w-2xl">
            <CardHeader className="space-y-1 pb-4">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-destructive h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3l-6.928-12c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <CardTitle className="text-center text-2xl">
                Đã xảy ra lỗi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-muted-foreground">
                  Xin lỗi, đã có lỗi xảy ra trong quá trình hiển thị component
                  này.
                </p>
                <p className="text-muted-foreground text-sm">
                  Vui lòng thử lại hoặc tải lại trang.
                </p>
              </div>

              {/* Error details in development mode */}
              {import.meta.env.DEV && this.state.error && (
                <div className="space-y-3">
                  <details className="border-destructive/20 bg-destructive/5 rounded-lg border">
                    <summary className="text-destructive hover:bg-destructive/10 cursor-pointer px-4 py-3 font-medium">
                      Chi tiết lỗi (Dev only)
                    </summary>
                    <div className="border-destructive/20 space-y-3 border-t p-4">
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          Error Message:
                        </p>
                        <p className="text-destructive font-mono text-sm">
                          {this.state.error.message}
                        </p>
                      </div>

                      {this.state.error.stack && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Stack Trace:
                          </p>
                          <pre className="bg-muted max-h-48 overflow-auto rounded p-3 text-xs">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}

                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Component Stack:
                          </p>
                          <pre className="bg-muted max-h-48 overflow-auto rounded p-3 text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={this.handleReset} variant="default">
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Thử lại
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Tải lại trang
                </Button>
              </div>

              {/* Support message */}
              <p className="text-muted-foreground text-center text-xs">
                Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
