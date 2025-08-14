// components/features/tasks/tasks-list.tsx
"use client";

import { TaskCard } from "@/components/features/tasks";
import AdminTaskCard from "@/components/features/tasks/admin-task-card";
import { CategorizedTasks, TaskWithUserStatus } from "@/lib/types/task";
import { getActionType, getTimeUntilExpiry } from "@/lib/utils/task-display";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { AUTH_QUERY_KEY, useAuth } from "../auth/hooks/use-auth";
import { useEffect, useState } from "react";
import { openLink, openTelegramLink } from "@telegram-apps/sdk-react";
import { startTask } from "@/lib/actions/task/start-task";
import { checkTask } from "@/lib/actions/task/check-task";
import showToast from "@/components/ui/custom-toast";
import { claimReward } from "@/lib/actions/task/claim-reward";
import { getAllTasks } from "@/lib/actions/task/get-all-tasks";
import { useDevice } from "@/components/providers/device-provider";
import { hapticFeedback } from "@/lib/haptic-feedback";

interface TasksListProps {
  initialData?: CategorizedTasks;
  error?: string;
}

export default function TasksList({ initialData, error }: TasksListProps) {
  const { user } = useAuth();
  const isMobile = useDevice();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN";

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", user!.id], // 🔥 Простой ключ
    queryFn: async () => {
      const result = await getAllTasks(); // 🔥 Один вызов
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    initialData,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (error) {
    return <div className="text-red-400">Ошибка: {error}</div>;
  }

  if (isLoading || !tasks) {
    return <div className="text-white/60">Загрузка заданий...</div>;
  }

  const setTaskLoading = (taskId: string, loading: boolean) => {
    setLoadingTasks((prev) => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  // Обработчики для обычных пользователей (существующая логика)
  const handleTaskAction = async (task: TaskWithUserStatus, action: string) => {
    if (loadingTasks.has(task.id)) {
      console.log("🚫 Task already loading, ignoring click");
      return;
    }

    // 🔥 Для FREE_BONUS особая логика
    if (task.type === "FREE_BONUS") {
      switch (action) {
        case "claim":
          await handleClaimFreeBonusReward(task);
          break;
        case "completed":
          console.log("✅ Free bonus already claimed");
          break;
        default:
          console.warn("⚠️ Unknown action for FREE_BONUS:", action);
      }
      return;
    }

    // Обычная логика для других типов
    switch (action) {
      case "available":
      case "timer":
        await handleStartTask(task);
        break;
      case "check":
        await handleCheckTask(task);
        break;
      case "claim":
        await handleClaimReward(task);
        break;
      case "completed":
        console.log("✅ Task already completed");
        break;
      default:
        console.warn("⚠️ Unknown action:", action);
    }
  };
  const handleClaimFreeBonusReward = async (task: TaskWithUserStatus) => {
    try {
      setTaskLoading(task.id, true);
      console.log("🎁 Claiming free bonus:", task.title);

      // Для FREE_BONUS сразу стартуем и забираем награду
      const startResult = await startTask(task.id);

      if (!startResult.success) {
        console.error("❌ Failed to start free bonus task:", startResult.error);
        showToast?.error("Ошибка при получении бонуса");
        setTaskLoading(task.id, false);
        return;
      }

      // Сразу забираем награду
      const claimResult = await claimReward(task.id);

      if (claimResult.success) {
        console.log("✅ Free bonus claimed successfully!");
        showToast?.success(`Вы получили ${task.reward} звёзд! ⭐`);
        hapticFeedback("success");

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["tasks", user!.id] }),
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
        ]);
      } else {
        console.error("❌ Failed to claim free bonus:", claimResult.error);
        showToast?.error(claimResult.error || "Ошибка при получении бонуса");
        hapticFeedback("error");
      }

      setTaskLoading(task.id, false);
    } catch (error) {
      console.error("💥 Error claiming free bonus:", error);
      showToast?.error("Произошла ошибка при получении бонуса");
      hapticFeedback("error");
      setTaskLoading(task.id, false);
    }
  };

  const handleStartTask = async (task: TaskWithUserStatus) => {
    try {
      setTaskLoading(task.id, true);
      console.log("🚀 Starting task:", task);

      if (task.type === "TELEGRAM_SUBSCRIPTION" && task.metadata?.channelUrl) {
        console.log("📱 Opening Telegram channel:", task.metadata.channelUrl);
        if (!isMobile) {
          return openLink(task.metadata.channelUrl);
        }
        openTelegramLink(task.metadata.channelUrl);
      }

      const result = await startTask(task.id);

      if (result.success) {
        console.log("✅ Task started successfully");
        await queryClient.invalidateQueries({ queryKey: ["tasks", user!.id] });
        setTaskLoading(task.id, false);
      } else {
        console.error("❌ Failed to start task:", result.error);
        setTaskLoading(task.id, false);
      }
    } catch (error) {
      console.error("💥 Error starting task:", error);
      setTaskLoading(task.id, false);
    }
  };

  const handleCheckTask = async (task: TaskWithUserStatus) => {
    try {
      setTaskLoading(task.id, true);
      console.log("🔍 Checking task completion:", task.title);

      const result = await checkTask(task.id);

      if (result.success && result.completed) {
        console.log("✅ Task completed successfully!");
        showToast?.success("Задание выполнено! Можете получить награду 🎉");

        await queryClient.invalidateQueries({ queryKey: ["tasks", user!.id] });
        setTaskLoading(task.id, false);
      } else {
        console.log("❌ Task not completed:", result.error);
        showToast?.error(result.error || "Задание не выполнено");
        setTaskLoading(task.id, false);
      }
    } catch (error) {
      console.error("💥 Error checking task:", error);
      showToast?.error("Произошла ошибка при проверке");
      setTaskLoading(task.id, false);
    }
  };

  const handleClaimReward = async (task: TaskWithUserStatus) => {
    try {
      setTaskLoading(task.id, true);
      console.log("🎁 Claiming reward for task:", task.title);

      const result = await claimReward(task.id);

      if (result.success) {
        console.log("✅ Reward claimed successfully!");
        showToast?.success(`Вы получили ${task.reward} звёзд! ⭐`);
        hapticFeedback("success");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["tasks", user!.id] }),
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
        ]);
        setTaskLoading(task.id, false);
      } else {
        console.error("❌ Failed to claim reward:", result.error);
        showToast?.error(result.error || "Ошибка при получении награды");
        setTaskLoading(task.id, false);
      }
    } catch (error) {
      console.error("💥 Error claiming reward:", error);
      showToast?.error("Произошла ошибка при получении награды");
      hapticFeedback("error");

      setTaskLoading(task.id, false);
    }
  };

  const handleCardClick = async (task: TaskWithUserStatus) => {
    // Для FREE_BONUS не открываем каналы
    if (task.type === "FREE_BONUS") {
      // Если доступен для получения - сразу забираем
      if (task.userStatus === "AVAILABLE") {
        await handleClaimFreeBonusReward(task);
      }
      return;
    }

    // Для обычных задач - открываем канал
    if (task.type === "TELEGRAM_SUBSCRIPTION" && task.metadata?.channelUrl) {
      if (!isMobile) {
        return openLink(task.metadata.channelUrl);
      }
      openTelegramLink(task.metadata.channelUrl);
    }

    // Если статус AVAILABLE - меняем на IN_PROGRESS
    if (task.userStatus === "AVAILABLE") {
      try {
        console.log("🚀 Auto-starting task from card click");
        const result = await startTask(task.id);

        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ["tasks", user!.id] });
        }
      } catch (error) {
        console.error("💥 Error auto-starting task:", error);
      }
    }
  };

  // 🔥 Функция для рендеринга карточки в зависимости от роли
  const renderTaskCard = (task: TaskWithUserStatus, key: string) => {
    if (isAdmin) {
      return <AdminTaskCard key={key} task={task} />;
    }

    // Обычная карточка для пользователей
    const actionType = getActionType(
      task.userStatus,
      task.expiresAt,
      task.duration,
      task.type
    );
    const timerValue =
      actionType === "timer"
        ? getTimeUntilExpiry(task.expiresAt, currentTime)
        : undefined;

    return (
      <TaskCard
        key={key}
        icon={task.icon}
        title={task.title}
        reward={`+${task.reward} звёзд`}
        action={actionType}
        timerValue={timerValue}
        isLoading={loadingTasks.has(task.id)}
        onAction={() => handleTaskAction(task, actionType)}
        onCardClick={() => handleCardClick(task)}
      />
    );
  };

  return (
    <>
      {/* Ежедневные задания */}
      {tasks.daily.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {tasks.daily.map((task) => renderTaskCard(task, task.id))}
        </div>
      )}

      {/* Одноразовые задания */}
      {tasks.oneTime.length > 0 && (
        <>
          <p className="mt-5 mb-2.5 font-mono font-medium text-lg">
            Одноразовые задания
          </p>
          <div className="flex flex-col gap-1.5">
            {tasks.oneTime.map((task) => renderTaskCard(task, task.id))}
          </div>
        </>
      )}

      {tasks.daily.length === 0 && tasks.oneTime.length === 0 && (
        <div className="text-white/60 text-center py-8">
          {isAdmin ? "Нет созданных заданий" : "Нет доступных заданий"}
        </div>
      )}
    </>
  );
}
