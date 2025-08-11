// app/admin/demo/page.tsx (Server Component)
import TelegramBackButton from "@/components/common/telegram-back-button";
import MainLayout from "@/components/layout/main-layout";
import { getDemoPrizes } from "@/lib/actions/admin/get-demo-prizes";
import { redirect } from "next/navigation";
import ActionButton from "@/components/ui/action-button";
import Link from "next/link";
import DemoPrizesClient from "@/components/features/admin/demo/demo-prizes-client";

export default async function DemoPrizesPage() {
  // Получаем данные на сервере
  const result = await getDemoPrizes();

  // Если ошибка доступа - редирект
  if (!result.success) {
    console.error("❌ [SERVER] Ошибка получения демо-призов:", result.error);
    return <>Ошибка..</>;
  }

  const prizes = result.data;

  return (
    <MainLayout
      bottomBar={
        <Link href="/admin/demo/create">
          <ActionButton>Создать приз</ActionButton>
        </Link>
      }
    >
      <TelegramBackButton />

      <div className="mb-6">
        <h1 className="text-white text-2xl font-sans mb-2">
          Призы демо-рулетки
        </h1>
        <p
          className="text-sm"
          style={{
            color: "rgba(255, 255,255, 0.6)",
          }}
        >
          Управление призами для демонстрационной рулетки
        </p>
      </div>

      {/* Передаем данные в клиентский компонент */}
      <DemoPrizesClient initialPrizes={prizes} />
    </MainLayout>
  );
}
