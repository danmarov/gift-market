import toast from "react-hot-toast";
import React from "react";

// Типы тостов
type ToastType = "success" | "warning" | "error";

// Интерфейс для кастомного тоста
interface CustomToastProps {
  type: ToastType;
  message: string;
}

// Компонент кастомного тоста
const CustomToast: React.FC<CustomToastProps> = ({ type, message }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "📄";
    }
  };

  const getGradientStyle = () => {
    switch (type) {
      case "success":
        return {
          background:
            "linear-gradient(135deg, rgba(0, 255, 127, 0.3), rgba(50, 205, 50, 0.4))",
        };
      case "warning":
        return {
          background:
            "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.3))",
        };
      case "error":
        return {
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.3))",
        };
      default:
        return {
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.3))",
        };
    }
  };

  return (
    <div
      className="relative backdrop-blur-md  text-white p-4 rounded-xl shadow-lg min-w-[280px] max-w-[380px]"
      style={{
        ...getGradientStyle(),
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <div className="flex items-center space-x-3">
        {/* <span className="text-lg">{getIcon()}</span> */}
        <span className="font-medium text-sm leading-relaxed ml-1">
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

  // Дополнительная функция для полного контроля
  custom: (
    message: string,
    type: ToastType = "success",
    duration: number = 1500
  ) => {
    toast((t) => <CustomToast type={type} message={message} />, {
      duration,
      position: "top-center",
    });
  },
};

// Экспорт для удобности
export default showToast;
