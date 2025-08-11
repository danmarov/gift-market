// app/tasks/page.tsx
import NavigationMenu from "@/components/features/navigation/navigation-menu";
import { ReferralTaskCard } from "@/components/features/tasks";
import TasksList from "@/components/features/tasks/tasks-list";
import LootBoxTasksWrapper from "@/components/features/lootbox/lootbox-tasks-wrapper";
import MainLayout from "@/components/layout/main-layout";
import Button from "@/components/ui/button";
import { getAllTasks } from "@/lib/actions/task/get-all-tasks";
import { getAllLootBoxTasks } from "@/lib/actions/admin/get-lootbox-tasks";
import { deleteLootBoxTask } from "@/lib/actions/admin/delete-lootbox-task";
import Link from "next/link";
import React from "react";
import RefferalInfoDrawer from "@/components/features/tasks/refferal-info-drawer";

export default async function TasksPage() {
  const tasksResult = await getAllTasks();
  const lootBoxTasksResult = tasksResult.isAdmin
    ? await getAllLootBoxTasks()
    : null;

  const handleDeleteLootBoxTask = async (formData: FormData) => {
    "use server";
    try {
      const taskId = formData.get("taskId") as string;
      const result = await deleteLootBoxTask(taskId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete task",
      };
    }
  };

  return (
    <MainLayout bottomBar={<NavigationMenu />}>
      {/* <p className="font-mono text-lg font-medium min-h-[35.5px]">
        Ежедневные задания
      </p> */}
      <h1 className="uppercase font-sans italic text-4xl font-bold text-center mt-4">
        задания
      </h1>
      <p className="text-[#E7D3E9] font-sans text-center text-[15px] mt-1 leading-[22px]">
        {tasksResult.isAdmin ? (
          <>
            Нажимайте на карточки для просмотра подробной информации и
            управления заданиями
          </>
        ) : (
          <>
            Собирайте очки выполняя простые действия, такие как подписаться на
            канал или пригласить друга и забирайте подарки!
          </>
        )}
      </p>

      {tasksResult.isAdmin && (
        <Link href={"/admin/task/create"}>
          <Button variant="secondary" className="mt-5">
            Создать
          </Button>
        </Link>
      )}

      <RefferalInfoDrawer trigger={<ReferralTaskCard className="mt-5" />} />
      <p className="mt-5 font-mono font-medium text-lg">Ежедневные задания</p>
      <p
        className="text-sm pt-2.5 pb-1"
        style={{
          color: "rgba(255,255,255, 0.8)",
        }}
      >
        💡 Задание истекает по завершению таймера
      </p>
      <TasksList
        initialData={tasksResult.success ? tasksResult.data : undefined}
        error={tasksResult.error}
      />

      {tasksResult.isAdmin && (
        <>
          <div className="flex items-center justify-between mt-8 mb-4">
            <div>
              <h2 className="font-mono text-lg font-medium">
                Задания онбординга
              </h2>
            </div>
            <Link href={"/admin/lootbox-task/create"}>
              <Button variant="secondary" size="sm">
                + Добавить
              </Button>
            </Link>
          </div>

          <LootBoxTasksWrapper
            initialData={
              lootBoxTasksResult?.success ? lootBoxTasksResult.data : undefined
            }
            error={lootBoxTasksResult?.error}
            onDelete={handleDeleteLootBoxTask}
          />
        </>
      )}
    </MainLayout>
  );
}
