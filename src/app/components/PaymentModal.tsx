import { useState, useEffect } from "react";
import { X, RefreshCw, ArrowRight, CheckCircle, LogIn } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../utils/api";
import { CustomField } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";

interface HolidayModeConfig {
  enabled: boolean;
  startNow: boolean;
  startDate: string;
  endDate: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
  totalPrice: number;
  productId?: string;
  productName?: string;
  customFields?: CustomField[];
  productImage?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  packageName,
  totalPrice,
  productId,
  productName,
  customFields,
  productImage,
}: PaymentModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [paymentId, setPaymentId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [step, setStep] = useState<"form" | "qr" | "success">("form");
  const [orderId, setOrderId] = useState("");
  const [qrData, setQrData] = useState("");
  const [qrExpiresAt, setQrExpiresAt] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [dynamicFormData, setDynamicFormData] = useState<Record<string, string>>({});
  
  // Holiday Mode State
  const [holidayMode, setHolidayMode] = useState<HolidayModeConfig | null>(null);
  const [isHolidayActive, setIsHolidayActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  // Fetch Holiday Mode Settings
  const fetchHolidayMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-content`);
      const data = await response.json();
      if (data.success && data.content?.holidayMode) {
        setHolidayMode(data.content.holidayMode);
      }
    } catch (error) {
      console.error("Failed to fetch holiday mode settings:", error);
    }
  };

  // Generate a random payment ID when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset to form step when modal opens
      setStep("form");
      
      // Initialize dynamic form data with empty values
      const initialData: Record<string, string> = {};
      customFields?.forEach((field) => {
        initialData[field.name] = "";
      });
      setDynamicFormData(initialData);
      
      setPaymentId("");
      setOrderId("");
      setQrData("");
      setTransactionRef("");
      fetchHolidayMode();
    }
  }, [isOpen, customFields]);

  // Handle Countdown Timer
  useEffect(() => {
    if (!holidayMode || !holidayMode.enabled) {
      setIsHolidayActive(false);
      return;
    }

    const checkHolidayStatus = () => {
      const now = new Date().getTime();
      const startTime = holidayMode.startNow ? 0 : new Date(holidayMode.startDate).getTime();
      const endTime = new Date(holidayMode.endDate).getTime();

      if (now >= startTime && now < endTime) {
        setIsHolidayActive(true);
        const distance = endTime - now;

        setTimeRemaining({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setIsHolidayActive(false);
        setTimeRemaining(null);
      }
    };

    checkHolidayStatus(); // Initial check
    const interval = setInterval(checkHolidayStatus, 1000);

    return () => clearInterval(interval);
  }, [holidayMode]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login or signup to continue");
      onClose();
      setShowLoginModal(true);
      return;
    }

    // Validate form - check if all fields are filled
    const emptyFields = customFields?.filter(field => !dynamicFormData[field.name]?.trim()) || [];
    if (emptyFields.length > 0) {
      toast.error(`Please fill in: ${emptyFields[0].name}`);
      return;
    }

    try {
      // Create order first
      const orderNumber = `ORD${Date.now()}`;
      const newOrderId = orderNumber;

      // Find email field value (could be named "Email", "email", "E-mail", etc.)
      const emailField = customFields?.find(f => f.type === "email" || f.name.toLowerCase().includes("email"));
      const customerEmail = emailField ? dynamicFormData[emailField.name] : user?.email || "";

      // Find name/id field (could be Player ID, User ID, Name, etc.)
      const nameField = customFields?.[0]; // Use first field as name
      const customerName = nameField ? dynamicFormData[nameField.name] : user?.name || "";

      const orderData = {
        productId: productId || "unknown",
        productName: productName || packageName || "Product",
        productImage: productImage || "",
        packageName: packageName || "Standard Package",
        price: totalPrice,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: "",
        customFields: dynamicFormData,
        paymentMethod: "Nepal Pay",
        userId: user?.id, // Add user ID to order
      };

      // Save order to backend
      const orderRes = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        console.error("Order creation error:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderResult = await orderRes.json();
      const createdOrderId = orderResult.order.id;

      // Generate QR code and save payment history
      const qrRes = await fetch(`${API_BASE_URL}/payment/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          orderId: createdOrderId,
          amount: totalPrice.toString(),
          userId: user?.id,
          userEmail: customerEmail,
          userName: customerName,
        }),
      });

      if (!qrRes.ok) {
        const errorData = await qrRes.json();
        console.error("QR generation error:", errorData);
        throw new Error(errorData.error || "Failed to generate QR code");
      }

      const qrResult = await qrRes.json();
      
      if (qrResult.success && qrResult.qr) {
        setOrderId(createdOrderId);
        setPaymentId(qrResult.qr.transactionRef);
        setQrData(qrResult.qr.qrString);
        setQrExpiresAt(qrResult.qr.expiresAt);
        setTransactionRef(qrResult.qr.transactionRef);
        
        // Move to QR step
        setStep("qr");
        toast.success("QR Code generated successfully!");
      } else {
        throw new Error("Invalid QR response");
      }
    } catch (error) {
      console.error("Error creating order/generating QR:", error);
      toast.error(`Failed to generate payment QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    setIsChecking(true);

    try {
      // Check payment status
      const statusRes = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!statusRes.ok) {
        throw new Error("Failed to check payment status");
      }

      const statusData = await statusRes.json();

      if (statusData.success && statusData.payment) {
        if (statusData.payment.status === "completed") {
          setStep("success");
          toast.success("Payment confirmed! Thank you for your purchase.");
        } else if (statusData.payment.status === "failed") {
          toast.error("Payment failed or was declined. Please try again.");
        } else {
          // Still pending
          toast.info("Payment not yet received. Please scan the QR and complete payment, then check again.");
        }
      } else {
        throw new Error("Invalid status response");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast.error("Failed to check payment status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // Format expiry time
  const getExpiryTime = () => {
    if (!qrExpiresAt) return "";
    const expiryDate = new Date(qrExpiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins <= 0) return "Expired";
    return `${diffMins} minutes`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-16 z-50 transition-transform duration-300">
        <div className="bg-white rounded-t-3xl shadow-2xl max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {step === "form"
                  ? "Order Details"
                  : step === "qr"
                  ? "Scan to Pay"
                  : "Payment Successful"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === "form"
                  ? "Fill in the details to proceed"
                  : step === "qr"
                  ? "Complete your payment via Nepal Pay"
                  : "Your payment has been successfully confirmed"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[65vh] overflow-y-auto">
            {isHolidayActive && timeRemaining ? (
              // Holiday Mode Step
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <RefreshCw className="w-10 h-10 text-[#0A64BC] animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payments Paused</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  We are currently not accepting new payments. Please check back after the countdown below!
                </p>
                
                {/* Timer */}
                <div className="flex gap-4 items-center justify-center mb-8">
                  {[
                    { label: "Days", value: timeRemaining.days },
                    { label: "Hours", value: timeRemaining.hours },
                    { label: "Minutes", value: timeRemaining.minutes },
                    { label: "Seconds", value: timeRemaining.seconds }
                  ].map((unit, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#0A64BC] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <span className="text-2xl font-bold text-white">
                          {unit.value.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-wider">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : step === "form" ? (
              // Form Step
              <form
                onSubmit={handleFormSubmit}
                className="space-y-4"
              >
                {/* Dynamic Custom Fields from Admin */}
                {customFields && customFields.length > 0 ? (
                  customFields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {field.name}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {field.helper && (
                        <p className="text-xs text-gray-500 mb-2">
                          {field.helper}
                        </p>
                      )}
                      {field.type === "textarea" ? (
                        <textarea
                          value={dynamicFormData[field.name] || ""}
                          onChange={(e) =>
                            setDynamicFormData({
                              ...dynamicFormData,
                              [field.name]: e.target.value,
                            })
                          }
                          placeholder={field.helper || `Enter ${field.name}`}
                          rows={3}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-base resize-none"
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={dynamicFormData[field.name] || ""}
                          onChange={(e) =>
                            setDynamicFormData({
                              ...dynamicFormData,
                              [field.name]: e.target.value,
                            })
                          }
                          placeholder={field.helper || `Enter ${field.name}`}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-base"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback if no custom fields defined
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Your Player ID{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={dynamicFormData.playerId || ""}
                        onChange={(e) =>
                          setDynamicFormData({
                            ...dynamicFormData,
                            playerId: e.target.value,
                          })
                        }
                        placeholder="Enter your Player ID"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Account and Password Recipient Email{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={dynamicFormData.email || ""}
                        onChange={(e) =>
                          setDynamicFormData({
                            ...dynamicFormData,
                            email: e.target.value,
                          })
                        }
                        placeholder="example@email.com"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-base"
                      />
                    </div>
                  </>
                )}

                {/* Order Summary in Form */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    {packageName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Package
                        </span>
                        <span className="font-medium text-gray-900">
                          {packageName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-[#0A64BC]">
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-white text-lg bg-[#0A64BC] hover:bg-[#084d92] shadow-lg active:scale-[0.98] transition-all min-h-[56px] flex items-center justify-center gap-2 mt-6"
                >
                  Proceed to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            ) : step === "qr" ? (
              // QR Code Step
              <>
                {/* Instruction */}
                <div className="bg-[#E8F3FC] rounded-xl p-4 mb-6 border border-[#0A64BC]/20">
                  <p className="text-center text-sm font-medium text-[#0A64BC]">
                    Please scan the QR code below to complete
                    your payment
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-[#0A64BC]/10">
                    <QRCodeSVG
                      value={qrData}
                      size={220}
                      level="H"
                      includeMargin={true}
                      fgColor="#0A64BC"
                    />
                  </div>
                </div>

                {/* Payment ID */}
                <div className="text-center mb-6">
                  <p className="text-xs text-gray-500 mb-1">
                    Payment ID
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                    {paymentId}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    {packageName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Package
                        </span>
                        <span className="font-medium text-gray-900">
                          {packageName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Player ID
                      </span>
                      <span className="font-medium text-gray-900">
                        {dynamicFormData.playerId}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Email
                      </span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {dynamicFormData.email}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-[#0A64BC]">
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Check Payment Button */}
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={isChecking}
                  className={`
                    w-full py-4 rounded-xl font-bold text-white text-lg transition-all min-h-[56px] flex items-center justify-center gap-2 mt-6
                    ${
                      isChecking
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#0A64BC] hover:bg-[#084d92] shadow-lg active:scale-[0.98]"
                    }
                  `}
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Check Payment Status
                    </>
                  )}
                </button>

                {/* QR Expiry Info */}
                {qrExpiresAt && (
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-500">
                      QR code expires in: <span className="font-semibold text-[#0A64BC]">{getExpiryTime()}</span>
                    </p>
                  </div>
                )}

                {/* Note */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  After scanning and completing payment, click
                  the button above to verify
                </p>
              </>
            ) : (
              // Success Step
              <>
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-gray-900">
                    Payment Successful!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Your order has been confirmed and you will receive your product details via email shortly.
                  </p>
                </div>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order ID</span>
                      <span className="font-mono font-medium text-gray-900">
                        {orderId}
                      </span>
                    </div>
                    {packageName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Package
                        </span>
                        <span className="font-medium text-gray-900">
                          {packageName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Player ID
                      </span>
                      <span className="font-medium text-gray-900">
                        {dynamicFormData.playerId}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Email
                      </span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {dynamicFormData.email}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Success Note */}
                <div className="bg-[#E8F3FC] rounded-xl p-4 border border-[#0A64BC]/20">
                  <p className="text-center text-xs text-[#0A64BC]">
                    <strong>Instant Delivery Guaranteed</strong> - Your order will be processed within 24 hours. Check your email for delivery details.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-xl font-bold text-white text-lg bg-[#0A64BC] hover:bg-[#084d92] shadow-lg active:scale-[0.98] transition-all min-h-[56px] mt-6"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}