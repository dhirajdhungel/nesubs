import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE_URL, publicAnonKey } from "../utils/api";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
  nesubsEmail?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ requireOtp: boolean; devOtp?: string }>;
  verifyLoginOtp: (email: string, otp: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<{ devOtp?: string }>;
  verifySignupOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to safely parse JSON responses (handles empty/non-JSON bodies)
    const parseJsonResponse = async (response: Response) => {
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        return { success: false, message: text || response.statusText };
      }
    };

    // Load user on mount
    useEffect(() => {
      loadUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await parseJsonResponse(response);

        if (data && data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem("authToken");
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const signup = async (email: string, name: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, name }),
        });

        const data = await parseJsonResponse(response);

        if (!data || !data.success) {
          throw new Error((data && data.message) || "Failed to send OTP");
        }

        return { devOtp: data.dev_otp };
      } catch (error: any) {
        throw new Error(error.message || "Failed to send OTP");
      }
    };

    const verifySignupOtp = async (email: string, otp: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, otp }),
        });

        const data = await parseJsonResponse(response);

        if (!data || !data.success) {
          throw new Error((data && data.message) || "Invalid OTP");
        }

        localStorage.setItem("authToken", data.token);
        setUser(data.user);
      } catch (error: any) {
        throw new Error(error.message || "Failed to verify OTP");
      }
    };

    const login = async (email: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        });

        const data = await parseJsonResponse(response);

        if (!data || !data.success) {
          throw new Error((data && data.message) || "Login failed");
        }

        return { requireOtp: data.requireOtp || false, devOtp: data.dev_otp };
      } catch (error: any) {
        throw new Error(error.message || "Login failed");
      }
    };

    const verifyLoginOtp = async (email: string, otp: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, otp }),
        });

        const data = await parseJsonResponse(response);

        if (!data || !data.success) {
          throw new Error((data && data.message) || "Invalid OTP");
        }

        localStorage.setItem("authToken", data.token);
        setUser(data.user);
      } catch (error: any) {
        throw new Error(error.message || "Failed to verify OTP");
      }
    };

    const logout = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        localStorage.removeItem("authToken");
        setUser(null);
      }
    };

    const value = {
      user,
      loading,
      login,
      verifyLoginOtp,
      signup,
      verifySignupOtp,
      logout,
      isAuthenticated: !!user,
      refreshUser: loadUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  }
