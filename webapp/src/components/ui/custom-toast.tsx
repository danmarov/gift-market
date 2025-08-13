import toast from "react-hot-toast";
import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

// Типы тостов
type ToastType = "success" | "warning" | "error" | "info";

// Интерфейс для кастомного тоста
interface CustomToastProps {
  type: ToastType;
  message: string;
}

// Компонент кастомного тоста
const CustomToast: React.FC<CustomToastProps> = ({ type, message }) => {
  const getIcon = () => {
    const iconProps = { size: 20, strokeWidth: 2.5 };

    switch (type) {
      case "success":
        return <CheckCircle {...iconProps} style={{ color: "#FFFFFF" }} />;
      case "warning":
        return <AlertTriangle {...iconProps} style={{ color: "#F59E0B" }} />;
      case "error":
        return <XCircle {...iconProps} style={{ color: "#EF4444" }} />;
      case "info":
        return <Info {...iconProps} style={{ color: "#3B82F6" }} />;
      default:
        return <Info {...iconProps} style={{ color: "#6B7280" }} />;
    }
  };

  const getBackgroundStyle = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#10B981",
          borderColor: "#059669",
        };
      case "warning":
        return {
          backgroundColor: "#FEF3C7",
          borderColor: "#F59E0B",
        };
      case "error":
        return {
          backgroundColor: "#FEE2E2",
          borderColor: "#EF4444",
        };
      case "info":
        return {
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgba(59, 130, 246, 0.3)",
        };
      default:
        return {
          backgroundColor: "rgba(107, 114, 128, 0.1)",
          borderColor: "rgba(107, 114, 128, 0.3)",
        };
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return { color: "#FFFFFF" };
      case "warning":
        return { color: "#92400E" };
      case "error":
        return { color: "#991B1B" };
      case "info":
        return { color: "#1E40AF" };
      default:
        return { color: "#374151" };
    }
  };

  return (
    <div
      className="relative p-4 rounded-lg shadow-lg min-w-[280px] max-w-[400px] border"
      style={{
        ...getBackgroundStyle(),
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <span
          className="font-medium text-sm leading-relaxed flex-1"
          style={getTextColor()}
        >
          {message}
        </span>
      </div>
    </div>
  );
};

// Основные функции для показа тостов
export const showToast = {
  success: (message: string, duration: number = 4000) => {
    toast((t) => <CustomToast type="success" message={message} />, {
      duration,
      position: "top-center",
    });
  },

  warning: (message: string, duration: number = 4000) => {
    toast((t) => <CustomToast type="warning" message={message} />, {
      duration,
      position: "top-center",
    });
  },

  error: (message: string, duration: number = 5000) => {
    toast((t) => <CustomToast type="error" message={message} />, {
      duration,
      position: "top-center",
    });
  },

  info: (message: string, duration: number = 4000) => {
    toast((t) => <CustomToast type="info" message={message} />, {
      duration,
      position: "top-center",
    });
  },

  // Дополнительная функция для полного контроля
  custom: (
    message: string,
    type: ToastType = "success",
    duration: number = 4000
  ) => {
    toast((t) => <CustomToast type={type} message={message} />, {
      duration,
      position: "top-center",
    });
  },
};

// Экспорт для удобности
export default showToast;
