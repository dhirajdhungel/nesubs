import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AlertCircle, ArrowLeft } from "lucide-react";

export function AdminNotFoundPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The admin page you're looking for doesn't exist or hasn't been created yet.
          </p>
          
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
