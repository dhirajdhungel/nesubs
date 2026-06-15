import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { InitAdmins } from "./components/InitAdmins";
import { InitData } from "./components/InitData";
import { AuthProvider } from "./contexts/AuthContext";

// Main application component
export default function App() {
  return (
    <AuthProvider>
      <InitAdmins />
      <InitData />
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}