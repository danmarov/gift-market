import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  maxSelected?: number;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      className,
      label,
      error,
      placeholder = "Выберите опции",
      options,
      value = [],
      onChange,
      disabled = false,
      name,
      maxSelected,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>(value);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectId = `multiselect-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const selectedOptions = options.filter((option) =>
      selectedValues.includes(option.value)
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

    // Исправляем useEffect - добавляем проверку на изменение
    useEffect(() => {
      if (JSON.stringify(value) !== JSON.stringify(selectedValues)) {
        setSelectedValues(value);
      }
    }, [value]); // убираем selectedValues из зависимостей

    const handleSelect = (optionValue: string) => {
      if (disabled) return;

      let newValues;
      if (selectedValues.includes(optionValue)) {
        // Убираем из выбранных
        newValues = selectedValues.filter((val) => val !== optionValue);
      } else {
        // Добавляем к выбранным (проверяем лимит)
        if (maxSelected && selectedValues.length >= maxSelected) {
          return; // Достигнут лимит
        }
        newValues = [...selectedValues, optionValue];
      }

      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    const handleRemoveBadge = (valueToRemove: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      const newValues = selectedValues.filter((val) => val !== valueToRemove);
      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    const ChevronIcon = () => (
      <svg
        className={cn(
          "w-4 h-4 transition-transform duration-200 flex-shrink-0",
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

    const CloseIcon = () => (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );

    const CheckIcon = () => (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );

    return (
      <>
        <style jsx>{`
          .multiselect-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
            position: relative;
          }

          .multiselect-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
          }

          .multiselect-trigger {
            min-height: 42px;
            width: 100%;
            padding: 6px 14px;
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
            gap: 8px;
          }

          .multiselect-trigger:focus {
            outline: none;
            border-color: white;
            background: rgba(255, 255, 255, 0.25);
          }

          .multiselect-trigger.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .multiselect-trigger.has-error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .multiselect-trigger.has-error:focus {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.15);
          }

          .multiselect-trigger.is-open {
            border-color: white;
            background: rgba(255, 255, 255, 0.25);
          }

          .multiselect-content {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;
            flex: 1;
            min-height: 20px;
          }

          .multiselect-placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .multiselect-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 8px;
            padding: 2px 6px;
            font-size: 12px;
            color: white;
            font-weight: 500;
          }

          .multiselect-badge-close {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 50%;
            padding: 1px;
            transition: background-color 0.2s ease;
          }

          .multiselect-badge-close:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .multiselect-dropdown {
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

          .multiselect-option {
            padding: 10px 14px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .multiselect-option:hover:not(.disabled) {
            background: rgba(255, 255, 255, 0.2);
          }

          .multiselect-option.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .multiselect-option.selected {
            background: rgba(255, 255, 255, 0.15);
          }

          .multiselect-option.max-reached {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .multiselect-error {
            color: #ef4444;
            font-size: 12px;
            font-weight: 400;
          }
        `}</style>

        <div className="multiselect-wrapper" ref={selectRef}>
          {label && (
            <label htmlFor={selectId} className="multiselect-label">
              {label}
            </label>
          )}

          <div
            ref={ref}
            id={selectId}
            className={cn(
              "multiselect-trigger",
              hasError ? "has-error" : "",
              isOpen ? "is-open" : "",
              disabled ? "disabled" : "",
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            tabIndex={disabled ? -1 : 0}
            {...props}
          >
            <div className="multiselect-content">
              {selectedOptions.length === 0 ? (
                <span className="multiselect-placeholder">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <div key={option.value} className="multiselect-badge">
                    <span>{option.label}</span>
                    <div
                      className="multiselect-badge-close"
                      onClick={(e) => handleRemoveBadge(option.value, e)}
                    >
                      <CloseIcon />
                    </div>
                  </div>
                ))
              )}
            </div>
            <ChevronIcon />
          </div>

          {isOpen && !disabled && (
            <div className="multiselect-dropdown">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const isMaxReached = maxSelected
                  ? selectedValues.length >= maxSelected && !isSelected
                  : false;
                const isOptionDisabled = option.disabled || isMaxReached;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "multiselect-option",
                      isSelected ? "selected" : "",
                      isOptionDisabled ? "disabled" : "",
                      isMaxReached ? "max-reached" : ""
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isOptionDisabled) {
                        handleSelect(option.value);
                      }
                    }}
                    disabled={isOptionDisabled}
                  >
                    <span>{option.label}</span>
                    {isSelected && <CheckIcon />}
                  </button>
                );
              })}
            </div>
          )}

          {error && <div className="multiselect-error">{error}</div>}

          {/* Скрытые input для форм */}
          {selectedValues.map((val) => (
            <input key={val} type="hidden" name={name} value={val} />
          ))}
        </div>
      </>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
