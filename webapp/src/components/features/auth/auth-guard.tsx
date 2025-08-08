"use client";

import LoadingScreen from "@/components/common/loading-screen";
import { useAuth } from "./hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface ErrorScreenProps {
  error: string | Error;
  onRetry?: () => void;
}

function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Иконка ошибки */}
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-white">
          Что-то пошло не так
        </h2>

        <p className="text-white/70 text-sm leading-relaxed">{errorMessage}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-pink-400 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:bg-white/90 active:scale-95"
          >
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  );
}
interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, error, refetchUser } = useAuth();

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={refetchUser} />;
  }

  if (!user) {
    return <ErrorScreen error="Пользователь не найден" onRetry={refetchUser} />;
  }

  return <>{children}</>;
}
