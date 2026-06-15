import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-[#0A64BC] text-white rounded-xl py-3 font-semibold hover:bg-[#084d92] transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={this.handleRefresh}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Refresh Page
                </button>
              </div>

              {/* Debug info in development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-gray-600 font-semibold">
                    Debug Info
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded overflow-auto max-h-40 text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
