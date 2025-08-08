"use client";

interface QuantitySelectorProps {
  currentQuantity: number;
  onQuantityChange: (quantity: number) => void;
  presets?: number[];
  maxQuantity?: number;
}

export default function QuantitySelector({
  currentQuantity,
  onQuantityChange,
  presets = [],
  maxQuantity = 999,
}: QuantitySelectorProps) {
  const updateQuantity = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(maxQuantity, newQuantity));
    onQuantityChange(clampedQuantity);
  };
  return (
    <div className="mt-5 space-x-2.5 flex items-center font-mono">
      <div className="amount-picker h-[32px] overflow-hidden">
        <button
          onClick={() => updateQuantity(currentQuantity - 1)}
          className="block px-3 h-full"
        >
          <span className="w-[17px] h-0.5 bg-white rounded-md block" />
        </button>
        <span className="font-mono font-medium text-base leading-5">
          {currentQuantity}
        </span>
        <button
          onClick={() => updateQuantity(currentQuantity + 1)}
          className="block px-3 h-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={17}
            height={17}
            viewBox="0 0 17 17"
            fill="none"
          >
            <rect y="7.5" width={17} height={2} rx={1} fill="white" />
            <rect x="7.5" width={2} height={17} rx={1} fill="white" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 ml-1">
        {presets.map((value) => (
          <button
            key={value}
            className="amount-picker-preset"
            onClick={() => updateQuantity(currentQuantity + value)}
          >
            +{value}
          </button>
        ))}
      </div>
    </div>
  );
}
