// database/src/tasks.ts
import { prisma } from "./client";
import { TaskType, TaskDuration, UserTaskStatus } from "@prisma/client";

export interface CreateTaskData {
  type: TaskType;
  duration: TaskDuration;
  title: string;
  description?: string;
  reward: number;
  icon: string;
  metadata?: any;
  maxCompletions?: number;
  startsAt?: Date;
}

export interface UpdateTaskData {
  type?: any;
  title?: string;
  description?: string;
  reward?: number;
  icon?: string;
  metadata?: any;
  isActive?: boolean;
  isVisible?: boolean;
  maxCompletions?: number;
  startsAt?: Date;
  duration?: TaskDuration;
}

// Вычисление срока окончания по тарифу
function calculateExpiresAt(duration: TaskDuration, startsAt: Date): Date {
  const start = new Date(startsAt);

  switch (duration) {
    case "ONE_DAY":
      return new Date(start.getTime() + 24 * 60 * 60 * 1000);
    case "ONE_WEEK":
      return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "ONE_MONTH":
      return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Unknown duration: ${duration}`);
  }
}

// Создать новое задание
export async function createTask(data: CreateTaskData) {
  const startsAt = data.startsAt || new Date();
  const expiresAt = calculateExpiresAt(data.duration, startsAt);

  return prisma.task.create({
    data: {
      type: data.type,
      duration: data.duration,
      title: data.title,
      description: data.description,
      reward: data.reward,
      icon: data.icon,
      metadata: data.metadata,
      maxCompletions: data.maxCompletions,
      startsAt,
      expiresAt,
    },
  });
}

// Получить задание по ID
export async function findTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      userTasks: true,
    },
  });
}

// Получить все активные и видимые задания
export async function getActiveTasks() {
  const now = new Date();

  return prisma.task.findMany({
    where: {
      isActive: true,
      isVisible: true,
      startsAt: { lte: now },
      expiresAt: { gt: now },
    },
    orderBy: [
      { duration: "asc" }, // сначала ONE_DAY, потом ONE_WEEK, потом ONE_MONTH
      { createdAt: "desc" },
    ],
  });
}

// Получить задания для конкретного пользователя с статусами
export async function getTasksForUser(userId: string) {
  const tasks = await getActiveTasks();

  // Получаем все UserTask для этого пользователя
  const userTasks = await prisma.userTask.findMany({
    where: { userId },
  });

  // Мержим данные
  return tasks.map((task) => {
    const userTask = userTasks.find((ut) => ut.taskId === task.id);

    return {
      ...task,
      userTaskStatus: userTask?.status || UserTaskStatus.AVAILABLE,
      startedAt: userTask?.startedAt,
      completedAt: userTask?.completedAt,
      claimedAt: userTask?.claimedAt,
    };
  });
}

// Получить задания по категориям
export async function getCategorizedTasksForUser(userId: string) {
  const tasks = await getTasksForUser(userId);

  return {
    daily: tasks.filter((task) => task.duration === "ONE_DAY"),
    oneTime: tasks.filter((task) =>
      ["ONE_WEEK", "ONE_MONTH"].includes(task.duration)
    ),
  };
}

export async function updateTask(id: string, data: UpdateTaskData) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new Error("Task not found");
  }

  const updates: any = {
    ...data,
    updatedAt: new Date(),
  };

  const newStartsAt = data.startsAt ?? task.startsAt;
  const newDuration = data.duration ?? task.duration;

  if (data.startsAt || data.duration) {
    updates.expiresAt = calculateExpiresAt(newDuration, newStartsAt);
  }

  return prisma.task.update({
    where: { id },
    data: updates,
  });
}

// Скрыть задание (soft delete)
export async function hideTask(id: string) {
  return updateTask(id, { isVisible: false });
}

// Деактивировать задание
export async function deactivateTask(id: string) {
  return updateTask(id, { isActive: false });
}

// Удалить задание (только для администрации)
export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
  });
}

export async function startTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    // Проверяем что задание существует и активно
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new Error("Task not found");
    }
    if (!task.isActive || !task.isVisible) {
      throw new Error("Task is not available");
    }
    const now = new Date();
    if (task.expiresAt <= now) {
      throw new Error("Task has expired");
    }
    // Проверяем текущий статус пользователя
    const existingUserTask = await tx.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    // Можно начать только если статус AVAILABLE или не существует
    if (
      existingUserTask &&
      existingUserTask.status !== UserTaskStatus.AVAILABLE
    ) {
      throw new Error("Task already started");
    }
    return tx.userTask.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: {
        userId,
        taskId,
        status: UserTaskStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      update: {
        status: UserTaskStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  });
}

export async function startAndCompleteTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    // Проверяем что задание существует и активно
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new Error("Task not found");
    }
    if (!task.isActive || !task.isVisible) {
      throw new Error("Task is not available");
    }

    const now = new Date();
    if (task.expiresAt <= now) {
      throw new Error("Task has expired");
    }

    // Проверяем текущий статус пользователя
    const existingUserTask = await tx.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    // Можно начать только если статус AVAILABLE или не существует
    if (
      existingUserTask &&
      existingUserTask.status !== UserTaskStatus.AVAILABLE
    ) {
      throw new Error("Task already started or completed");
    }

    // 🔥 Сразу создаем задачу в статусе COMPLETED
    const userTask = await tx.userTask.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: {
        userId,
        taskId,
        status: UserTaskStatus.COMPLETED, // 🔥 Сразу COMPLETED
        startedAt: now,
        completedAt: now, // 🔥 Сразу завершаем
      },
      update: {
        status: UserTaskStatus.COMPLETED,
        startedAt: now,
        completedAt: now,
      },
    });

    // Увеличиваем счетчик выполнений
    await tx.task.update({
      where: { id: taskId },
      data: { completedCount: { increment: 1 } },
    });

    return userTask;
  });
}

// Завершить задание с проверками
export async function completeTask(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    // Проверяем что задание существует
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new Error("Task not found");
    }

    // Проверяем статус пользователя
    const userTask = await tx.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    if (!userTask) {
      throw new Error("Task was not started");
    }

    // 🔥 Для FREE_BONUS разрешаем завершение из любого статуса кроме CLAIMED
    if (task.type === "FREE_BONUS") {
      if (userTask.status === UserTaskStatus.CLAIMED) {
        throw new Error("Task already claimed");
      }
      // Можем завершить из любого другого статуса
    } else {
      // Для обычных задач - только из IN_PROGRESS
      if (userTask.status !== UserTaskStatus.IN_PROGRESS) {
        throw new Error(`Cannot complete task with status: ${userTask.status}`);
      }
    }

    // Обновляем статус
    const updatedUserTask = await tx.userTask.update({
      where: { userId_taskId: { userId, taskId } },
      data: {
        status: UserTaskStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Увеличиваем счетчик только если еще не увеличили
    if (userTask.status !== UserTaskStatus.COMPLETED) {
      await tx.task.update({
        where: { id: taskId },
        data: { completedCount: { increment: 1 } },
      });
    }

    return updatedUserTask;
  });
}

// Получить награду с проверками
export async function claimTaskReward(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    // Проверяем что задание существует
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new Error("Task not found");
    }
    // Проверяем статус пользователя
    const userTask = await tx.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    if (!userTask) {
      throw new Error("Task was not started");
    }
    if (userTask.status !== UserTaskStatus.COMPLETED) {
      throw new Error(`Cannot claim reward. Task status: ${userTask.status}`);
    }
    // Проверяем не получена ли уже награда
    if (userTask.claimedAt) {
      throw new Error("Reward already claimed");
    }
    // Обновляем статус
    const updatedUserTask = await tx.userTask.update({
      where: { userId_taskId: { userId, taskId } },
      data: {
        status: UserTaskStatus.CLAIMED,
        claimedAt: new Date(),
      },
    });
    // Начисляем награду
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: { increment: task.reward },
      },
    });
    return updatedUserTask;
  });
}

// Получить статистику заданий
export async function getTaskStats() {
  const [total, active, expired, completions] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({
      where: {
        isActive: true,
        isVisible: true,
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.task.count({
      where: {
        expiresAt: { lte: new Date() },
      },
    }),
    prisma.task.aggregate({
      _sum: {
        completedCount: true,
      },
    }),
  ]);

  return {
    total,
    active,
    expired,
    totalCompletions: completions._sum.completedCount || 0,
  };
}

// Получить топ заданий по выполнениям
export async function getTopTasksByCompletions(limit = 10) {
  return prisma.task.findMany({
    where: {
      completedCount: { gt: 0 },
    },
    orderBy: {
      completedCount: "desc",
    },
    take: limit,
  });
}

export async function getAllTasksForAdmin(userId: string) {
  const allTasks = await prisma.task.findMany({
    orderBy: [{ duration: "asc" }, { createdAt: "desc" }],
  });

  // Получаем все UserTask для этого пользователя
  const userTasks = await prisma.userTask.findMany({
    where: { userId },
  });

  // Мержим данные
  return allTasks.map((task) => {
    const userTask = userTasks.find((ut) => ut.taskId === task.id);

    return {
      ...task,
      userTaskStatus: userTask?.status || UserTaskStatus.AVAILABLE,
      startedAt: userTask?.startedAt,
      completedAt: userTask?.completedAt,
      claimedAt: userTask?.claimedAt,
    };
  });
}

// Получить все задания по категориям для админа
export async function getAllCategorizedTasksForAdmin(userId: string) {
  const tasks = await getAllTasksForAdmin(userId);

  return {
    daily: tasks.filter((task) => task.duration === "ONE_DAY"),
    oneTime: tasks.filter((task) =>
      ["ONE_WEEK", "ONE_MONTH"].includes(task.duration)
    ),
  };
}
