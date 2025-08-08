import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name: string;
  direction?: "vertical" | "horizontal";
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      label,
      error,
      options,
      value,
      onChange,
      disabled = false,
      name,
      direction = "vertical",
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;

    // Внутреннее состояние для uncontrolled режима
    const [selectedValue, setSelectedValue] = useState(value || "");

    // Синхронизация с внешним состоянием
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleChange = (optionValue: string) => {
      if (disabled) return;

      // Обновляем внутреннее состояние если uncontrolled
      if (value === undefined) {
        setSelectedValue(optionValue);
      }

      onChange?.(optionValue);
    };

    // Определяем какое значение использовать
    const currentValue = value !== undefined ? value : selectedValue;

    console.log("Radio state:", { value, selectedValue, currentValue });

    return (
      <>
        <style jsx>{`
          .radio-wrapper {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .radio-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
          }

          .radio-options {
            display: flex;
            gap: 12px;
          }

          .radio-options.vertical {
            flex-direction: column;
          }

          .radio-options.horizontal {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .radio-option {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            cursor: pointer;
          }

          .radio-option.disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }

          .radio-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }

          .radio-circle {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            margin-top: 2px;
            position: relative;
          }

          .radio-circle:hover {
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.15);
          }

          .radio-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #bd8bb4;
            transition: all 0.2s ease;
          }

          /* Checked состояние */
          .radio-option.checked .radio-circle {
            background: white;
            border-color: white;
          }

          .radio-option.checked .radio-circle:hover {
            background: #f9fafb;
          }

          /* Error состояние */
          .radio-option.has-error .radio-circle {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .radio-option.has-error.checked .radio-circle {
            background: white;
            border-color: white;
          }

          .radio-option.has-error.checked .radio-circle:hover {
            background: #f9fafb;
          }

          .radio-input:focus + .radio-circle {
            outline: 2px solid rgba(255, 255, 255, 0.3);
            outline-offset: 2px;
          }

          .radio-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .radio-option-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
          }

          .radio-option-label.disabled {
            cursor: not-allowed;
          }

          .radio-option-description {
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
            line-height: 1.4;
          }

          .radio-error {
            color: #ef4444;
            font-size: 12px;
            font-weight: 400;
          }
        `}</style>

        <div className="radio-wrapper" ref={ref} {...props}>
          {label && <label className="radio-label">{label}</label>}

          <div
            className={cn(
              "radio-options",
              direction === "vertical" ? "vertical" : "horizontal"
            )}
          >
            {options.map((option, index) => {
              const optionId = `${groupId}-option-${index}`;
              const isChecked = currentValue === option.value;
              const isDisabled = disabled || option.disabled;

              return (
                <div
                  key={option.value}
                  className={cn(
                    "radio-option",
                    isDisabled && "disabled",
                    isChecked && "checked",
                    hasError && "has-error"
                  )}
                  onClick={() => !isDisabled && handleChange(option.value)}
                >
                  <input
                    type="radio"
                    id={optionId}
                    name={name}
                    value={option.value}
                    checked={isChecked}
                    onChange={() => {}} // контролируем через onClick
                    disabled={isDisabled}
                    className="radio-input"
                  />

                  <div className="radio-circle">
                    {isChecked && !isDisabled && <div className="radio-dot" />}
                  </div>

                  <div className="radio-content">
                    <label
                      htmlFor={optionId}
                      className={cn(
                        "radio-option-label",
                        isDisabled && "disabled"
                      )}
                    >
                      {option.label}
                    </label>
                    {option.description && (
                      <div className="radio-option-description">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && <div className="radio-error">{error}</div>}
        </div>
      </>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
