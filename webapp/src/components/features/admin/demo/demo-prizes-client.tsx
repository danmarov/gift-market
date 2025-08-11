"use client";
import Button from "@/components/ui/button";
import showToast from "@/components/ui/custom-toast";
import TGSPlayer from "@/components/ui/tgs-wrapper";
import { deleteDemoPrize } from "@/lib/actions/admin/delete-demo-prize";
import { getDemoPrizes, DemoPrize } from "@/lib/actions/admin/get-demo-prizes";
import { Trash, Plus, Send } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Input from "@/components/ui/input";
import { useAuth } from "../../auth/hooks/use-auth";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { sendDemoLink } from "@/lib/actions/admin/send-demo-link";
import { cn } from "@/lib/utils";

interface DemoPrizesClientProps {
  initialPrizes: DemoPrize[];
}

// Выносим PrizeCard отдельно и мемоизируем
const PrizeCard = memo(
  ({
    prize,
    isDeleting,
    onDelete,
  }: {
    prize: DemoPrize;
    isDeleting: boolean;
    onDelete: (prizeId: number, prizeName: string) => void;
  }) => {
    const [userId, setUserId] = useState("");
    const [isSending, startTransition] = useTransition(); // Добавляем useTransition

    const handleSendDemo = () => {
      if (!userId.trim()) {
        showToast.error("Введите ID пользователя");
        return;
      }

      console.log(
        `📤 [SEND DEMO] User ID: "${userId}", Prize ID: ${prize.id}, Prize Name: "${prize.name}"`
      );

      startTransition(async () => {
        try {
          const result = await sendDemoLink(userId, prize.id);

          if (result.success) {
            showToast.success(result.message);
            setUserId(""); // Очищаем только при успехе
          } else {
            showToast.error(result.error);
          }
        } catch (error) {
          console.error("💥 [CLIENT] Ошибка отправки демо-ссылки:", error);
          showToast.error("Произошла ошибка при отправке");
        }
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSendDemo();
    };
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255, 255,255, 0.1)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg mt-3 truncate">
              {prize.name}
            </h3>
            <p
              className="text-sm mt-3"
              style={{
                color: "rgba(255, 255,255, 0.6)",
              }}
            >
              {prize.description || "Без описания"}
            </p>
            <div
              className="flex items-center gap-4 text-xs mt-3"
              style={{
                color: "rgba(255, 255,255, 0.8)",
              }}
            >
              <TGSPlayer
                src={prize.mediaUrl}
                playOnClick
                style={{
                  width: "100px",
                  height: "100px",
                }}
              />
              <div className="flex flex-col gap-1">
                <span>ID: {prize.id}</span>
                <span>
                  Создан: {new Date(prize.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 absolute right-0">
            <Button
              variant="secondary"
              onClick={() => onDelete(prize.id, prize.name)}
              disabled={isDeleting}
              style={{
                padding: "9px 10px",
                opacity: isDeleting ? 0.5 : 1,
                cursor: isDeleting ? "not-allowed" : "pointer",
              }}
            >
              <Trash size={20} />
            </Button>
          </div>
        </div>

        <form className="mt-3" onSubmit={handleSubmit}>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID пользователя"
            disabled={isSending}
            className={cn(isSending ? "opacity-60" : "opacity-100")}
            suffix={
              <button
                type="submit"
                disabled={isSending}
                className={cn(isSending ? "opacity-60" : "opacity-100")}
              >
                <Send
                  className="cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={handleSendDemo}
                />
              </button>
            }
          />
        </form>
      </div>
    );
  }
);

PrizeCard.displayName = "PrizeCard";

export default function DemoPrizesClient({
  initialPrizes,
}: DemoPrizesClientProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const [isSendingRandom, startRandomTransition] = useTransition();
  const [randomUserId, setRandomUserId] = useState("");

  const { user } = useAuth();

  // React Query для данных
  const { data: prizes = initialPrizes } = useQuery({
    queryKey: ["demo-prizes"],
    queryFn: async () => {
      const result = await getDemoPrizes();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    initialData: initialPrizes,
    staleTime: 30 * 1000, // 30 секунд
  });

  const handleDelete = (prizeId: number, prizeName: string) => {
    // Подтверждение удаления
    if (!confirm(`Вы уверены, что хотите удалить приз "${prizeName}"?`)) {
      return;
    }

    console.log(`🗑️ [CLIENT] Удаление приза: ${prizeName} (ID: ${prizeId})`);

    setDeletingId(prizeId);

    startTransition(async () => {
      try {
        // Вызываем server action
        const result = await deleteDemoPrize(prizeId);

        if (result.success) {
          console.log(`✅ [CLIENT] Приз "${prizeName}" успешно удален`);

          // Обновляем React Query кэш
          queryClient.invalidateQueries({ queryKey: ["demo-prizes"] });

          // Не показываем тост при успехе
        } else {
          console.error("❌ [CLIENT] Ошибка удаления приза:", result.error);
          showToast.error(result.error);
        }
      } catch (error) {
        console.error("💥 [CLIENT] Неожиданная ошибка:", error);
        showToast.error("Произошла ошибка при удалении");
      } finally {
        setDeletingId(null);
      }
    });
  };
  const handleSendRandomDemo = () => {
    if (!randomUserId.trim()) {
      showToast.error("Введите ID пользователя");
      return;
    }

    console.log(`🎲 [SEND RANDOM DEMO] User ID: "${randomUserId}"`);

    startRandomTransition(async () => {
      try {
        const result = await sendDemoLink(randomUserId, "random");

        if (result.success) {
          showToast.success(result.message);
          setRandomUserId(""); // Очищаем только при успехе
        } else {
          showToast.error(result.error);
        }
      } catch (error) {
        console.error(
          "💥 [CLIENT] Ошибка отправки рандомной демо-ссылки:",
          error
        );
        showToast.error("Произошла ошибка при отправке");
      }
    });
  };

  const handleRandomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendRandomDemo();
  };
  if (prizes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-white text-lg font-semibold mb-2">
          Призов пока нет
        </h3>
        <p className="text-white/60 text-sm mb-6">
          Создайте первый приз для демо-рулетки
        </p>
        <Link href="/admin/demo/create">
          <Button variant="primary">
            <Plus size={20} className="mr-2" />
            Создать приз
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {user?.telegramId && (
        <h2
          className="text-white text-lg font-sans mb-2 cursor-pointer"
          onClick={() => {
            hapticFeedback("success");
            navigator.clipboard.writeText(user.telegramId);
          }}
        >
          Ваш ID: {user.telegramId}
        </h2>
      )}
      <p className="text-white text-lg font-sans">
        🎲 Отправить рандомный подарок
      </p>

      <form className="mb-3" onSubmit={handleRandomSubmit}>
        <Input
          value={randomUserId}
          onChange={(e) => setRandomUserId(e.target.value)}
          placeholder="ID пользователя для рандомного подарка"
          disabled={isSendingRandom}
          className={cn(isSendingRandom ? "opacity-60" : "opacity-100")}
          suffix={
            <button
              type="submit"
              disabled={isSendingRandom}
              className={cn(isSendingRandom ? "opacity-60" : "opacity-100")}
            >
              <Send
                className={`cursor-pointer transition-colors ${
                  isSendingRandom ? "text-gray-400" : "hover:text-blue-400"
                }`}
              />
            </button>
          }
        />
      </form>
      {prizes.map((prize) => (
        <PrizeCard
          key={prize.id}
          prize={prize}
          isDeleting={deletingId === prize.id}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
