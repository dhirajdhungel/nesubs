import { useState } from "react";
import { X, Mail, User, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const { signup, verifySignupOtp } = useAuth();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const result = await signup(email, name);
      
      // Show dev OTP in development
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        toast.success(`OTP sent! Dev OTP: ${result.devOtp}`);
      } else {
        toast.success("OTP sent to your email!");
      }
      
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      await verifySignupOtp(email, otp);
      toast.success("Account created successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setEmail("");
    setName("");
    setOtp("");
    setDevOtp("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md mx-auto overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0A64BC] to-[#0850a0] px-6 pt-8 pb-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === "form" ? "Create Account" : "Verify OTP"}
            </h2>
            <p className="text-white/90 text-sm">
              {step === "form" 
                ? "Sign up to start buying digital services"
                : `We sent a code to ${email}`
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {step === "form" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:ring-0 outline-none transition-colors text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:ring-0 outline-none transition-colors text-base"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A64BC] text-white py-3.5 rounded-xl font-semibold hover:bg-[#0850a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                {/* Dev OTP Display */}
                {devOtp && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      <span className="font-semibold">Dev Mode:</span> {devOtp}
                    </p>
                  </div>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#0A64BC] text-white py-3.5 rounded-xl font-semibold hover:bg-[#0850a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verify & Create Account
                  </>
                )}
              </button>

              {/* Resend */}
              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full text-sm text-gray-600 hover:text-[#0A64BC] transition-colors"
              >
                Didn't receive code? Try again
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => {
                handleClose();
                onSwitchToLogin();
              }}
              className="text-[#0A64BC] font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
