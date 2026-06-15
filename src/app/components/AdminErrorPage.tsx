import { useRouteError, isRouteErrorResponse, Link, useNavigate } from "react-router";
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminErrorPage() {
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
    console.error("Admin Error caught by AdminErrorPage:", error);
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Determine if this is a 404 error
  const is404 = errorDetails.status === 404;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Error Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${
            is404 
              ? "bg-blue-50 border-blue-100" 
              : "bg-red-50 border-red-100"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                is404 
                  ? "bg-blue-100" 
                  : "bg-red-100"
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  is404 
                    ? "text-[#0A64BC]" 
                    : "text-red-500"
                }`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {is404 ? "Page Not Found" : "Something Went Wrong"}
                </h1>
                <p className="text-sm text-gray-600">
                  Error {errorDetails.status} - {errorDetails.statusText}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {is404 
                  ? "The admin page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the dashboard."
                  : errorDetails.message
                }
              </p>
              
              {!is404 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> If this error persists, try refreshing the page or clearing your browser cache. If the problem continues, please check the browser console for more details.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dashboard */}
              <Link
                to="/admin/dashboard"
                className="flex items-center justify-center gap-2 bg-[#0A64BC] text-white rounded-lg py-3 px-4 font-semibold hover:bg-[#084d92] transition-colors"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </Link>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg py-3 px-4 font-semibold hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>

              {/* Go Back - Only show if possible */}
              {errorDetails.canGoBack && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 rounded-lg py-3 px-4 font-semibold hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Go Back
                </button>
              )}

              {/* Settings */}
              <Link
                to="/admin/settings"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 rounded-lg py-3 px-4 font-semibold hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </div>
          </div>

          {/* Debug Info (only in development) */}
          {import.meta.env.DEV && error instanceof Error && (
            <div className="px-6 py-4 bg-gray-900 text-gray-100 border-t border-gray-800">
              <details className="text-xs">
                <summary className="cursor-pointer font-semibold mb-2 text-yellow-400">
                  Debug Information (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-black rounded">
                  <p className="text-red-400 font-semibold mb-2">{error.name}: {error.message}</p>
                  <pre className="whitespace-pre-wrap break-words text-gray-300">
                    {error.stack}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Nesubs Admin Dashboard - {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
