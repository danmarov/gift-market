// components/features/tasks/admin-task-card.tsx
import { TaskIconType, TaskWithUserStatus } from "@/lib/types/task";
import { cn } from "@sglara/cn";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Info,
  User,
  Settings,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import Link from "next/link";

interface AdminTaskCardProps {
  className?: string;
  task: TaskWithUserStatus;
}

const icons = {
  telegram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.88407 10.0107C7.17816 7.98488 10.0368 6.6388 11.4722 5.98575C15.5578 4.13324 16.4166 3.81338 16.9687 3.80005C17.0914 3.80005 17.3613 3.8267 17.5453 3.98663C17.6925 4.11991 17.7293 4.29317 17.7539 4.42644C17.7784 4.55972 17.7829 4.83959 17.7784 5.05283C17.5576 7.58505 16.6006 13.729 16.1099 16.5544C15.9013 17.7539 15.4964 18.1537 15.1038 18.1937C14.245 18.2737 13.5947 17.5807 12.7727 16.9942C11.4722 16.0746 10.7484 15.5016 9.48469 14.5953C8.02471 13.5558 8.9694 12.9827 9.80368 12.0498C10.0245 11.8099 13.791 8.07817 13.8647 7.74498C13.8769 7.705 13.8769 7.54507 13.791 7.4651C13.7052 7.38514 13.5825 7.41179 13.4843 7.43845C13.3494 7.4651 11.2882 8.95778 7.27631 11.9032C6.6874 12.343 6.15985 12.5562 5.68136 12.5429C5.1538 12.5295 4.14776 12.223 3.38709 11.9565C2.46693 11.6366 1.7308 11.4633 1.79215 10.9036C1.82896 10.6104 2.19702 10.3172 2.88407 10.0107Z"
        fill="currentColor"
      />
    </svg>
  ),
  tiktok: (
    <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-md"></div>
  ),
  youtube: (
    <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-md"></div>
  ),
  instagram: (
    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md"></div>
  ),
  twitter: (
    <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-md"></div>
  ),
};

const getAdminTaskStatus = (task: TaskWithUserStatus) => {
  const now = new Date();
  const isExpired = task.expiresAt <= now;
  const isActive = task.isActive !== false;
  const isVisible = task.isVisible !== false;
  const hasStarted = !task.startsAt || task.startsAt <= now;

  if (!isActive) {
    return {
      label: "Неактивно",
      variant: "inactive" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(30, 41, 59, 0.2)",
        borderColor: "rgba(71, 85, 105, 0.3)",
      },
    };
  }

  if (!isVisible) {
    return {
      label: "Скрыто",
      variant: "hidden" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(120, 53, 15, 0.2)",
        borderColor: "rgba(245, 158, 11, 0.3)",
      },
    };
  }

  if (!hasStarted) {
    return {
      label: "Ожидает",
      variant: "waiting" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(30, 58, 138, 0.2)",
        borderColor: "rgba(59, 130, 246, 0.3)",
      },
    };
  }

  if (isExpired) {
    return {
      label: "Истекло",
      variant: "expired" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(127, 29, 29, 0.2)",
        borderColor: "rgba(239, 68, 68, 0.3)",
      },
    };
  }

  const userBadges = {
    AVAILABLE: {
      label: "Доступно",
      variant: "available" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(6, 78, 59, 0.2)",
        borderColor: "rgba(16, 185, 129, 0.3)",
      },
    },
    IN_PROGRESS: {
      label: "В процессе",
      variant: "in_progress" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(124, 45, 18, 0.2)",
        borderColor: "rgba(249, 115, 22, 0.3)",
      },
    },
    COMPLETED: {
      label: "Выполнено",
      variant: "completed" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(20, 83, 45, 0.2)",
        borderColor: "rgba(34, 197, 94, 0.3)",
      },
    },
    CLAIMED: {
      label: "Получено",
      variant: "claimed" as const,
      style: {
        color: "#fff",
        backgroundColor: "rgba(88, 28, 135, 0.2)",
        borderColor: "rgba(147, 51, 234, 0.3)",
      },
    },
  };

  return (
    userBadges[task.userStatus as keyof typeof userBadges] ||
    userBadges.AVAILABLE
  );
};

const Badge = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
      style={style}
    >
      {children}
    </span>
  );
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminTaskCard({
  className = "",
  task,
}: AdminTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getAdminTaskStatus(task);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Admin action: ${action} for task ${task.id}`);
  };

  return (
    <div className={cn("admin-task-card-wrapper", className)}>
      {/* Main Card */}
      <div
        className="task-card-backdrop cursor-pointer hover:bg-white/5 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="task-card-icon flex-shrink-0">
              {icons[task.icon as keyof typeof icons]}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-sm font-medium text-white">
                {task.title}
              </span>
              <span className="text-sans text-xs text-[#E7D3E9] leading-3">
                +{task.reward} звёзд
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge style={status.style}>{status.label}</Badge>
            <button
              onClick={handleToggleExpand}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-5">
          {/* Task Details Section */}
          <div
            className="rounded-xl p-5 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
          >
            {/* Description at the top if exists */}
            {task.description && (
              <div className="mb-5">
                <p className="text-white/90 text-sm font-sans leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            <div className="space-y-1">
              {/* Duration & Task Type Row */}
              <div className="grid grid-cols-2 gap-1">
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs text-white/80 font-sans font-medium">
                      Период
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm font-mono">
                    {task.duration === "ONE_DAY"
                      ? "1 день"
                      : task.duration === "ONE_WEEK"
                      ? "1 неделя"
                      : "1 месяц"}
                  </span>
                </div>

                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs text-white/80 font-sans font-medium">
                      Тип
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm font-sans leading-tight">
                    {task.type === "TELEGRAM_SUBSCRIPTION"
                      ? "Telegram подписка"
                      : task.type}
                  </span>
                </div>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-purple-300" />
                    <span className="text-xs text-white/80 font-sans font-medium">
                      Статус
                    </span>
                  </div>
                  <Badge
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      color: task.isActive !== false ? "#FFF" : "#FFF",
                      backgroundColor:
                        task.isActive !== false
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      borderColor:
                        task.isActive !== false
                          ? "rgba(16, 185, 129, 0.4)"
                          : "rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    {task.isActive !== false ? "Активно" : "Неактивно"}
                  </Badge>
                </div>

                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs text-white/80 font-sans font-medium">
                      Видимость
                    </span>
                  </div>
                  <Badge
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      color: task.isVisible !== false ? "#FFF" : "#FFF",
                      backgroundColor:
                        task.isVisible !== false
                          ? "rgba(59, 130, 246, 0.15)"
                          : "rgba(107, 114, 128, 0.15)",
                      borderColor:
                        task.isVisible !== false
                          ? "rgba(59, 130, 246, 0.4)"
                          : "rgba(107, 114, 128, 0.4)",
                    }}
                  >
                    {task.isVisible !== false ? "Видимо" : "Скрыто"}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              {task.startsAt && (
                <div
                  className="flex items-center justify-between p-4 rounded-lg mt-1"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    <span className="text-white/90 text-sm font-sans font-medium">
                      Начало
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm font-mono">
                    {formatDate(task.startsAt)}
                  </span>
                </div>
              )}

              <div
                className="flex items-center justify-between p-4 rounded-lg mt-1"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-300" />
                  <span className="text-white/90 text-sm font-sans font-medium">
                    Окончание
                  </span>
                </div>
                <span
                  className={cn(
                    "font-semibold text-sm font-mono",
                    task.expiresAt <= new Date() ? "text-red-300" : "text-white"
                  )}
                >
                  {formatDate(task.expiresAt)}
                </span>
              </div>
              <div
                className="flex items-center justify-between p-4 rounded-lg mt-1"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <div className="flex items-center gap-2">
                  <ChartNoAxesColumnIncreasing className="w-4 h-4 text-green-400" />
                  <span className="text-white/90 text-sm font-sans font-medium">
                    Выполнено/Лимит
                  </span>
                </div>
                <span
                  className={cn(
                    "font-semibold text-sm font-mono",
                    task.completedCount &&
                      task.maxCompletions &&
                      task.completedCount >= task.maxCompletions
                      ? "text-red-300"
                      : "text-green-400"
                  )}
                >
                  {task.completedCount}/{task.maxCompletions ?? "-"}
                </span>
              </div>

              {/* Channel & Chat ID */}
              {task.metadata?.channelUrl && (
                <div
                  className="flex items-center justify-between p-4 rounded-lg mt-1"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-300" />
                    <span className="text-white/90 text-sm font-sans font-medium">
                      Канал
                    </span>
                  </div>
                  <a
                    href={task.metadata.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-blue-100 font-semibold text-sm font-mono max-w-[50%] truncate"
                  >
                    {task.metadata.channelUrl}
                  </a>
                </div>
              )}

              {task.metadata?.chatId && (
                <div
                  className="flex items-center justify-between p-4 rounded-lg mt-1"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <span className="text-white/90 text-sm font-sans font-medium">
                    Chat ID
                  </span>
                  <code
                    className="font-mono px-3 py-2 rounded-md text-sm font-medium"
                    style={{
                      color: "rgba(255, 255, 255, 0.95)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    {task.metadata.chatId}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div
            className="rounded-xl p-5 backdrop-blur-sm mt-1"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href={`/admin/task/edit/${task.id}`}
                  // onClick={(e) => handleActionClick("edit", e)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 font-sans"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.10)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Редактировать
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
