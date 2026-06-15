import { Wallet, CreditCard, Building2 } from "lucide-react";

const iconMap = {
  Wallet,
  CreditCard,
  Building2,
};

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface PaymentMethodSelectorProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

export function PaymentMethodSelector({
  method,
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  const Icon = iconMap[method.icon as keyof typeof iconMap] || Wallet;

  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-2xl border-2 transition-all text-left ${
        selected
          ? "border-[#0A64BC] bg-[#E8F3FC]"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            selected ? "bg-[#0A64BC]" : "bg-gray-100"
          }`}
        >
          <Icon className={`w-6 h-6 ${selected ? "text-white" : "text-gray-600"}`} />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${selected ? "text-[#0A64BC]" : "text-gray-900"}`}>
            {method.name}
          </p>
          <p className="text-sm text-gray-600">Fast and secure</p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected ? "border-[#0A64BC]" : "border-gray-300"
          }`}
        >
          {selected && (
            <div className="w-3 h-3 rounded-full bg-[#0A64BC]"></div>
          )}
        </div>
      </div>
    </button>
  );
}
