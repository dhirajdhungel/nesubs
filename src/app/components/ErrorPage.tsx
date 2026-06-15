import { useRouteError, isRouteErrorResponse, Link, useNavigate } from "react-router";
import { AlertTriangle, Home, RefreshCw, Mail, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState({
    status: 500,
    statusText: "Internal Server Error",
    message: "Something went wrong",
    canGoBack: false,
  });

  useEffect(() => {
    // Check if we can go back
    const canGoBack = window.history.length > 1;

    if (isRouteErrorResponse(error)) {
      setErrorDetails({
        status: error.status,
        statusText: error.statusText || "Error",
        message: error.data?.message || error.statusText || "An error occurred",
        canGoBack,
      });
    } else if (error instanceof Error) {
      setErrorDetails({
        status: 500,
        statusText: "Application Error",
        message: error.message || "An unexpected error occurred",
        canGoBack,
      });
    } else {
      setErrorDetails({
        status: 500,
        statusText: "Unknown Error",
        message: "An unexpected error occurred. Please try again.",
        canGoBack,
      });
    }

    // Log error for debugging
    console.error("Error caught by ErrorPage:", error);
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    navigate("/help");
  };

  // Determine if this is a 404 error
  const is404 = errorDetails.status === 404;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            is404 
              ? "bg-blue-100" 
              : "bg-red-100"
          }`}>
            <AlertTriangle className={`w-12 h-12 ${
              is404 
                ? "text-[#0A64BC]" 
                : "text-red-500"
            }`} />
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-gray-300 mb-2">
              {errorDetails.status}
            </h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {is404 ? "Page Not Found" : errorDetails.statusText}
            </h2>
            <p className="text-gray-600 text-sm">
              {is404 
                ? "The page you're looking for doesn't exist or has been moved."
                : errorDetails.message
              }
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            {/* Go Home */}
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-[#0A64BC] text-white rounded-xl py-3.5 font-semibold hover:bg-[#084d92] transition-colors active:scale-[0.98] transform"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Link>

            {/* Refresh Page */}
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 rounded-xl py-3.5 font-semibold hover:bg-gray-200 transition-colors active:scale-[0.98] transform"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </button>

            {/* Go Back - Only show if possible */}
            {errorDetails.canGoBack && (
              <button
                onClick={handleGoBack}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 rounded-xl py-3.5 font-semibold hover:bg-gray-200 transition-colors active:scale-[0.98] transform"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            )}

            {/* Contact Support - Only for non-404 errors */}
            {!is404 && (
              <button
                onClick={handleContactSupport}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#0A64BC] text-[#0A64BC] rounded-xl py-3.5 font-semibold hover:bg-blue-50 transition-colors active:scale-[0.98] transform"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {is404 
              ? "Looking for something specific? Try searching from the home page."
              : "If this problem persists, please contact our support team."
            }
          </p>
        </div>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && error instanceof Error && (
          <details className="mt-4 bg-gray-900 text-gray-100 rounded-lg p-4 text-xs">
            <summary className="cursor-pointer font-semibold mb-2">
              Debug Information (Dev Only)
            </summary>
            <pre className="whitespace-pre-wrap break-words">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
