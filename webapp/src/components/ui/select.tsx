import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      placeholder = "Выберите опцию",
      options,
      value,
      onChange,
      disabled = false,
      name,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || "");
    const selectRef = useRef<HTMLDivElement>(null);
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;

      setSelectedValue(optionValue);
      setIsOpen(false);
      onChange?.(optionValue);
    };

    const ChevronIcon = () => (
      <svg
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );

    return (
      <>
        <style jsx>{`
          .select-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
            position: relative;
          }

          .select-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
          }

          .select-trigger {
            width: 100%;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            color: white;
            font-size: 14px;
            backdrop-filter: blur(4px);
            transition: all 0.2s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-align: left;
          }

          .select-trigger:focus {
            outline: none;
            border-color: white;
            background: rgba(255, 255, 255, 0.25);
          }

          .select-trigger:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .select-trigger.has-error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .select-trigger.has-error:focus {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.15);
          }

          .select-trigger.is-open {
            border-color: white;
            background: rgba(255, 255, 255, 0.25);
          }

          .select-placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .select-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 50;
            margin-top: 4px;
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            backdrop-filter: blur(8px);
            max-height: 200px;
            overflow-y: auto;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          .select-option {
            padding: 10px 14px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
          }

          .select-option:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
          }

          .select-option:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .select-option.selected {
            background: rgba(255, 255, 255, 0.3);
          }

          .select-error {
            color: #ef4444;
            font-size: 12px;
            font-weight: 400;
          }
        `}</style>

        <div className="select-wrapper" ref={selectRef}>
          {label && (
            <label htmlFor={selectId} className="select-label">
              {label}
            </label>
          )}

          <button
            ref={ref}
            id={selectId}
            type="button"
            className={cn(
              "select-trigger",
              hasError ? "has-error" : "",
              isOpen ? "is-open" : "",
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            {...props}
          >
            <span className={selectedOption ? "" : "select-placeholder"}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronIcon />
          </button>

          {isOpen && !disabled && (
            <div className="select-dropdown">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "select-option",
                    selectedValue === option.value ? "selected" : ""
                  )}
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {error && <div className="select-error">{error}</div>}

          <input type="hidden" name={name} value={selectedValue} />
        </div>
      </>
    );
  }
);

Select.displayName = "Select";

export default Select;
