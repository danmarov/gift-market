// components/features/lootbox/lootbox-tasks-list.tsx
"use client";

import React, { useState } from "react";
import { LootBoxTask } from "@/lib/types/lootbox";
import showToast from "@/components/ui/custom-toast";
import { cn } from "@sglara/cn";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  ExternalLink,
  Settings,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface LootBoxTasksListProps {
  initialData?: LootBoxTask[];
  error?: string;
  onEdit?: (task: LootBoxTask) => void;
  onDelete?: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  isPending?: boolean;
}

const icons = {
  telegram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.88407 10.0107C7.17816 7.98488 10.0368 6.6388 11.4722 5.98575C15.5578 4.13324 16.4166 3.81338 16.9687 3.80005C17.0914 3.80005 17.3613 3.8267 17.5453 3.98663C17.6925 4.11991 17.7293 4.29317 17.7539 4.42644C17.7784 4.55972 17.7829 4.83959 17.7784 5.05283C17.5576 7.58505 16.6006 13.729 16.1099 16.5544C15.9013 17.7539 15.4964 18.1537 15.1038 18.1937C14.245 18.2737 13.5947 17.5807 12.7727 16.9942C11.4722 16.0746 10.7484 15.5016 9.48469 14.5953C8.02471 13.5558 8.9694 12.9827 9.80368 12.0498C10.0245 11.8099 13.791 8.07817 13.8647 7.74498C13.8769 7.705 13.8769 7.54507 13.791 7.4651C13.7052 7.38514 13.5825 7.41179 13.4843 7.43845C13.3494 7.4651 11.2882 8.95778 7.27631 11.9032C6.6874 12.343 6.15985 12.5562 5.68136 12.5429C5.1538 12.5295 4.14776 12.223 3.38709 11.9565C2.46693 11.6366 1.7308 11.4633 1.79215 10.9036C1.82896 10.6104 2.19702 10.3172 2.88407 10.0107Z"
        fill="white"
      />
      <g style={{ mixBlendMode: "hue" }}>
        <rect width={22} height={22} fill="#93398A" />
      </g>
    </svg>
  ),
  youtube: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M19.3125 6.64062C19.1562 6.04688 18.7031 5.59375 18.1094 5.4375C16.9844 5.15625 11 5.15625 11 5.15625C11 5.15625 5.01562 5.15625 3.89062 5.4375C3.29688 5.59375 2.84375 6.04688 2.6875 6.64062C2.40625 7.76562 2.40625 10.0781 2.40625 10.0781C2.40625 10.0781 2.40625 12.3906 2.6875 13.5156C2.84375 14.1094 3.29688 14.5625 3.89062 14.7188C5.01562 15 11 15 11 15C11 15 16.9844 15 18.1094 14.7188C18.7031 14.5625 19.1562 14.1094 19.3125 13.5156C19.5938 12.3906 19.5938 10.0781 19.5938 10.0781C19.5938 10.0781 19.5938 7.76562 19.3125 6.64062ZM9.0625 12.5781V7.57812L14.0312 10.0781L9.0625 12.5781Z"
        fill="white"
      />
      <g style={{ mixBlendMode: "hue" }}>
        <rect width={22} height={22} fill="#93398A" />
      </g>
    </svg>
  ),
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M11 5.5C13.4844 5.5 15.5 7.51562 15.5 10C15.5 12.4844 13.4844 14.5 11 14.5C8.51562 14.5 6.5 12.4844 6.5 10C6.5 7.51562 8.51562 5.5 11 5.5ZM11 12.8125C12.5625 12.8125 13.8125 11.5625 13.8125 10C13.8125 8.4375 12.5625 7.1875 11 7.1875C9.4375 7.1875 8.1875 8.4375 8.1875 10C8.1875 11.5625 9.4375 12.8125 11 12.8125ZM16.4375 5.3125C16.4375 5.96875 15.9062 6.5 15.25 6.5C14.5938 6.5 14.0625 5.96875 14.0625 5.3125C14.0625 4.65625 14.5938 4.125 15.25 4.125C15.9062 4.125 16.4375 4.65625 16.4375 5.3125Z"
        fill="white"
      />
      <g style={{ mixBlendMode: "hue" }}>
        <rect width={22} height={22} fill="#93398A" />
      </g>
    </svg>
  ),
  twitter: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M19.5 5.46875C18.8438 5.75 18.1562 5.96875 17.4375 6.09375C18.1875 5.65625 18.75 4.96875 19 4.15625C18.3125 4.5625 17.5625 4.84375 16.75 5C16.0625 4.3125 15.125 3.90625 14.0938 3.90625C12.0938 3.90625 10.4688 5.53125 10.4688 7.53125C10.4688 7.8125 10.5 8.09375 10.5625 8.34375C7.5 8.1875 4.78125 6.75 2.96875 4.5625C2.65625 5.0625 2.46875 5.65625 2.46875 6.3125C2.46875 7.53125 3.09375 8.59375 4.03125 9.21875C3.4375 9.1875 2.90625 9.03125 2.4375 8.78125V8.8125C2.4375 10.5625 3.6875 12.0312 5.34375 12.375C5.0625 12.4375 4.75 12.5 4.40625 12.5C4.15625 12.5 3.9375 12.4688 3.6875 12.4375C4.1875 13.875 5.53125 14.9375 7.125 14.9688C5.875 15.9688 4.28125 16.5625 2.53125 16.5625C2.25 16.5625 1.96875 16.5312 1.6875 16.5C3.3125 17.5625 5.21875 18.1875 7.28125 18.1875C14.0938 18.1875 17.8125 12.5625 17.8125 7.9375C17.8125 7.78125 17.8125 7.625 17.8125 7.46875C18.5312 6.96875 19.1562 6.34375 19.6562 5.625C18.9688 5.9375 18.25 6.125 17.5 6.1875C18.2812 5.71875 18.875 4.96875 19.1562 4.09375C18.4375 4.53125 17.6562 4.84375 16.8125 5.03125C16.125 4.28125 15.1562 3.8125 14.0938 3.8125Z"
        fill="white"
      />
      <g style={{ mixBlendMode: "hue" }}>
        <rect width={22} height={22} fill="#93398A" />
      </g>
    </svg>
  ),
  tiktok: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M16.8984 7.15469C15.8672 7.15469 14.9141 6.83594 14.1328 6.28906V11.0078C14.1328 13.6719 12.0234 15.8125 9.32812 15.8125C6.63281 15.8125 4.52344 13.6719 4.52344 11.0078C4.52344 8.34375 6.63281 6.20312 9.32812 6.20312C9.57812 6.20312 9.82812 6.23438 10.0625 6.26562V8.90625C9.82812 8.84375 9.57812 8.8125 9.32812 8.8125C8.05469 8.8125 7.03125 9.83594 7.03125 11.1094C7.03125 12.3828 8.05469 13.4062 9.32812 13.4062C10.6016 13.4062 11.6484 12.3516 11.6484 11.0781V2.1875H14.1328C14.1328 4.57812 15.5234 6.60156 17.5 7.125V9.76562C17.1719 9.79688 16.875 9.82812 16.5469 9.82812C16.3281 9.82812 16.1094 9.79688 15.8906 9.76562V7.15469H16.8984Z"
        fill="white"
      />
      <g style={{ mixBlendMode: "hue" }}>
        <rect width={22} height={22} fill="#93398A" />
      </g>
    </svg>
  ),
};

export default function LootBoxTasksList({
  initialData = [],
  error,
  onDelete,
  onEdit,
  isPending = false,
}: LootBoxTasksListProps) {
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<LootBoxTask[]>(initialData);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  if (error) {
    return <div className="text-red-400 text-sm">Ошибка: {error}</div>;
  }

  const handleToggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-white/40 text-lg mb-2">🎁</div>
        <p className="text-white/60 text-sm">
          Пока нет задач для получения подарков
        </p>
        <p className="text-white/40 text-xs mt-1">
          Создайте первую задачу для пользователей
        </p>
      </div>
    );
  }

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

  return (
    <div className="flex flex-col gap-1.5">
      {tasks.map((task) => {
        const isExpanded = expandedTasks.has(task.id);

        return (
          <div key={task.id} className={cn("admin-task-card-wrapper")}>
            {/* Main Card */}
            <div
              className="task-card-backdrop cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => handleToggleExpand(task.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="task-card-icon flex-shrink-0">
                    {icons[task.icon as keyof typeof icons] || icons.telegram}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm font-medium text-white">
                      {task.title}
                    </span>
                    <span className="text-sans text-xs text-[#E7D3E9] leading-3">
                      Для получения подарков
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    style={{
                      color: task.isActive ? "#FFF" : "#FFF",
                      backgroundColor: task.isActive
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                      borderColor: task.isActive
                        ? "rgba(16, 185, 129, 0.3)"
                        : "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    {task.isActive ? "Активно" : "Неактивно"}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(task.id);
                    }}
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
                    {/* Sort Order & Status Row */}
                    <div className="grid grid-cols-2 gap-1">
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-purple-300" />
                          <span className="text-xs text-white/80 font-sans font-medium">
                            Порядок
                          </span>
                        </div>
                        <span className="text-white font-semibold text-sm font-mono">
                          {task.sortOrder}
                        </span>
                      </div>

                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-indigo-300" />
                          <span className="text-xs text-white/80 font-sans font-medium">
                            Статус
                          </span>
                        </div>
                        <Badge
                          style={{
                            fontSize: "12px",
                            padding: "4px 10px",
                            color: task.isActive ? "#FFF" : "#FFF",
                            backgroundColor: task.isActive
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                            borderColor: task.isActive
                              ? "rgba(16, 185, 129, 0.4)"
                              : "rgba(239, 68, 68, 0.4)",
                          }}
                        >
                          {task.isActive ? "Активно" : "Неактивно"}
                        </Badge>
                      </div>
                    </div>

                    {/* Channel URL */}
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
                      <Link
                        href={task.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-200 hover:text-blue-100 font-semibold text-sm font-mono max-w-[50%] truncate"
                      >
                        {task.channelUrl}
                      </Link>
                    </div>

                    {/* Chat ID */}
                    {task.chatId && (
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
                          {task.chatId}
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
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/admin/lootbox-task/edit/${task.id}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 font-sans disabled:opacity-50"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          if (!onEdit) return;
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.10)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          if (!onEdit) return;
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.1)";
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Изменить
                      </Link>

                      <form
                        className="flex-1"
                        action={async (formData: FormData) => {
                          if (loadingTasks.has(task.id) || isPending) return;
                          if (!onDelete) return;
                          if (
                            !confirm(
                              "Вы уверены, что хотите удалить эту задачу?"
                            )
                          )
                            return;

                          try {
                            setLoadingTasks((prev) =>
                              new Set(prev).add(task.id)
                            );
                            const result = await onDelete(formData);
                            if (result.success) {
                              showToast.success(
                                result.message || "Задача удалена"
                              );
                              setTasks((prev) =>
                                prev.filter((t) => t.id !== task.id)
                              );
                            } else {
                              showToast.error(
                                result.error || "Ошибка при удалении"
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Error deleting lootbox task:",
                              error
                            );
                            showToast.error("Произошла ошибка");
                          } finally {
                            setLoadingTasks((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(task.id);
                              return newSet;
                            });
                          }
                        }}
                      >
                        <input type="hidden" name="taskId" value={task.id} />
                        <button
                          type="submit"
                          disabled={loadingTasks.has(task.id) || isPending}
                          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 font-sans disabled:opacity-50"
                          style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                          }}
                          onMouseEnter={(e) => {
                            if (loadingTasks.has(task.id) || isPending) return;
                            e.currentTarget.style.backgroundColor =
                              "rgba(239, 68, 68, 0.2)";
                            e.currentTarget.style.borderColor =
                              "rgba(239, 68, 68, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            if (loadingTasks.has(task.id) || isPending) return;
                            e.currentTarget.style.backgroundColor =
                              "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.borderColor =
                              "rgba(239, 68, 68, 0.2)";
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          {loadingTasks.has(task.id) ? "Удаляем..." : "Удалить"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
