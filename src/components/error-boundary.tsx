"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}

function DefaultErrorFallback({ error, errorInfo, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Произошла ошибка</CardTitle>
          </div>
          <CardDescription>
            Приложение столкнулось с неожиданной ошибкой. Пожалуйста, попробуйте обновить страницу.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>
                <div className="font-mono text-sm mt-2">{error.message}</div>
              </AlertDescription>
            </Alert>
          )}

          {errorInfo && process.env.NODE_ENV === "development" && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                Детали ошибки (только в режиме разработки)
              </summary>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-64">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={resetError} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
            <Button
              onClick={() => {
                window.location.reload();
              }}
              variant="outline"
            >
              Обновить страницу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error Boundary компонент для перехвата ошибок React
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Вызываем callback если он предоставлен
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Логируем ошибку в консоль
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

