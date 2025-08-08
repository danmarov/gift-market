import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, id, children, ...props }, ref) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    // Добавляем внутреннее состояние для controlled/uncontrolled логики
    const [isChecked, setIsChecked] = useState(
      props.checked || props.defaultChecked || false
    );

    // Синхронизируем с внешним состоянием если компонент controlled
    useEffect(() => {
      if (props.checked !== undefined) {
        setIsChecked(props.checked);
      }
    }, [props.checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      // Если компонент uncontrolled, обновляем внутреннее состояние
      if (props.checked === undefined) {
        setIsChecked(newChecked);
      }

      // Вызываем внешний onChange если есть
      props.onChange?.(e);
    };

    // Определяем какое состояние использовать
    const shouldShowCheck =
      props.checked !== undefined ? props.checked : isChecked;

    console.log("Checkbox state:", {
      propsChecked: props.checked,
      isChecked,
      shouldShowCheck,
      disabled: props.disabled,
    });

    return (
      <>
        <style jsx>{`
          .checkbox-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .checkbox-container {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            cursor: pointer;
          }

          .checkbox-container.disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }

          .checkbox-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }

          .checkbox-box {
            width: 18px;
            height: 18px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .checkbox-box:hover {
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.15);
          }

          /* Обычное checked состояние */
          .checkbox-input:checked + .checkbox-box {
            background: white;
            border-color: white;
            color: #bd8bb4;
          }

          .checkbox-input:checked + .checkbox-box:hover {
            background: #f9fafb;
            color: #bd8bb4;
          }

          /* Error состояние для unchecked */
          .checkbox-input.has-error + .checkbox-box {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          /* Error состояние для checked - важно чтобы было после обычного checked */
          .checkbox-input.has-error:checked + .checkbox-box {
            background: white;
            border-color: white;
            color: #bd8bb4;
          }

          .checkbox-input.has-error:checked + .checkbox-box:hover {
            background: #f9fafb;
            color: #bd8bb4;
          }

          .checkbox-input:focus + .checkbox-box {
            outline: 2px solid rgba(255, 255, 255, 0.3);
            outline-offset: 2px;
          }

          .checkbox-input:disabled + .checkbox-box {
            cursor: not-allowed;
          }

          .checkbox-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .checkbox-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
          }

          .checkbox-label.disabled {
            cursor: not-allowed;
          }

          .checkbox-description {
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
            line-height: 1.4;
          }

          .checkbox-error {
            color: #ef4444;
            font-size: 12px;
            font-weight: 400;
          }
        `}</style>

        <div className="checkbox-wrapper">
          <div
            className={cn("checkbox-container", props.disabled && "disabled")}
          >
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={cn(
                "checkbox-input",
                hasError && "has-error",
                className
              )}
              {...props}
              onChange={handleChange}
              checked={shouldShowCheck}
            />
            <div className="checkbox-box">
              {shouldShowCheck && !props.disabled && (
                <CheckIcon size={12} className="text-[#bd8bb4]" />
              )}
            </div>

            {(label || children) && (
              <div className="checkbox-content">
                {(label || children) && (
                  <label
                    htmlFor={checkboxId}
                    className={cn(
                      "checkbox-label",
                      props.disabled && "disabled"
                    )}
                  >
                    {label || children}
                  </label>
                )}
                {description && (
                  <div className="checkbox-description">{description}</div>
                )}
              </div>
            )}
          </div>

          {error && <div className="checkbox-error">{error}</div>}
        </div>
      </>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
