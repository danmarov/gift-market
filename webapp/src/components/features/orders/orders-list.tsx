// components/features/orders/orders-list.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ProductPreview from "@/components/features/product/product-preview";
import { Calendar } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  PurchasesByStatus,
  TabType,
  PurchaseWithDetails,
} from "@/lib/types/purchase";
import {
  markPurchaseAsSent,
  cancelPurchase,
} from "@/lib/actions/admin/update-purchase";
import { getPurchases } from "@/lib/actions/admin/get-purchases";
import showToast from "@/components/ui/custom-toast";
import StarsIndicator from "@/components/ui/stars-indicator";

interface OrdersListProps {
  initialData?: PurchasesByStatus;
  error?: string;
}

const tabConfig: Record<
  TabType,
  {
    label: string;
    color?: string;
    getCount: (data: PurchasesByStatus) => number;
  }
> = {
  PENDING: {
    label: "Ожидают",
    color: "rgba(239, 68, 68, 0.7)",
    getCount: (data) => data.pending.length,
  },
  HISTORY: {
    label: "История",
    color: "rgba(99, 102, 241, 0.7)",
    getCount: (data) => data.history.length,
  },
};
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${Math.floor(diffHours / 24)} дн назад`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  showToast?.success("Скопировано в буфер обмена");
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Ожидает";
    case "SENT":
      return "Отправлено";
    case "CANCELLED":
      return "Отменено";
    default:
      return status;
  }
};

export default function OrdersList({ initialData, error }: OrdersListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      const result = await getPurchases();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    ...(initialData && { initialData }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (error) {
    return <div className="text-red-400">Ошибка: {error}</div>;
  }

  if (isLoading || !purchases) {
    return <div className="text-white/60">Загрузка заказов...</div>;
  }

  const filteredOrders =
    activeTab === "PENDING" ? purchases.pending : purchases.history;

  const setOrderLoading = (orderId: number, loading: boolean) => {
    setLoadingOrders((prev) => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(orderId.toString());
      } else {
        newSet.delete(orderId.toString());
      }
      return newSet;
    });
  };

  const handleSendOrder = async (orderId: number) => {
    if (loadingOrders.has(orderId.toString())) return;

    try {
      setOrderLoading(orderId, true);
      console.log("🎁 Sending order:", orderId);

      const result = await markPurchaseAsSent(orderId);

      if (result.success) {
        showToast?.success("Заказ отмечен как отправленный");
        await queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      } else {
        showToast?.error(result.error || "Ошибка при отправке заказа");
      }
    } catch (error) {
      console.error("💥 Error sending order:", error);
      showToast?.error("Произошла ошибка при отправке заказа");
    } finally {
      setOrderLoading(orderId, false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (loadingOrders.has(orderId.toString())) return;

    try {
      setOrderLoading(orderId, true);
      console.log("🚫 Cancelling order:", orderId);

      const result = await cancelPurchase(orderId);

      if (result.success) {
        showToast?.success("Заказ отменен, средства возвращены");
        await queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      } else {
        showToast?.error(result.error || "Ошибка при отмене заказа");
      }
    } catch (error) {
      console.error("💥 Error cancelling order:", error);
      showToast?.error("Произошла ошибка при отмене заказа");
    } finally {
      setOrderLoading(orderId, false);
    }
  };

  return (
    <>
      {/* Табы */}
      <div
        className="w-full overflow-x-auto mb-6"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-2 min-w-max px-1">
          {Object.entries(tabConfig).map(([tab, config]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap backdrop-blur-sm flex-1"
              )}
              style={{
                backgroundColor:
                  activeTab === tab
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.03)",
              }}
            >
              <span className="mx-auto">
                <span className="font-sans">{config.label}</span>
                {config.label === "Ожидают" &&
                  config.getCount(purchases) > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-xs font-medium ml-1"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.7)",
                        color: "#fff",
                      }}
                    >
                      {config.getCount(purchases)}
                    </span>
                  )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-lg font-medium text-white/90">
          {tabConfig[activeTab].label} ({filteredOrders.length})
        </p>
      </div>

      {/* Список заказов */}
      <div className="flex flex-col gap-2">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isLoading={loadingOrders.has(order.id.toString())}
            onSend={() => handleSendOrder(order.id)}
            onCancel={() => handleCancelOrder(order.id)}
          />
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <p>Заказов нет</p>
          </div>
        )}
      </div>
    </>
  );
}

interface OrderCardProps {
  order: PurchaseWithDetails;
  isLoading: boolean;
  onSend: () => void;
  onCancel: () => void;
}

function OrderCard({ order, isLoading, onSend, onCancel }: OrderCardProps) {
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Заголовок заказа */}
      <div
        className="flex items-center p-2"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="text-sm flex-1">
          <p className="font-bold">Номер заказа</p>
          <span className="text-[#eee]">#{order.id}</span>
        </div>
        <div className="text-sm flex-1">
          <p className="font-bold">Стоимость</p>
          <span className="text-[#eee] font-medium">
            <StarsIndicator
              value={order.totalPrice}
              iconSize={{
                width: 14,
                height: 13,
              }}
              className="mr-1 text-base"
            />
          </span>
        </div>
        {order.status !== "PENDING" && (
          <div className="text-sm flex-1">
            <p className="font-bold">Статус</p>
            <span
              className={cn(
                "font-bold",
                order.status === "CANCELLED" && "text-red-400",
                order.status === "SENT" && "text-green-400"
              )}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        )}
      </div>

      {/* Содержимое заказа */}
      <div className="p-2 flex relative">
        <div className="w-2/5 aspect-square">
          <ProductPreview src={order.gift.mediaUrl} playOnLoad={false} />
        </div>
        <div className="flex-1 flex items-center pl-[3%]">
          <div className="text-sm font-bold">
            <p className="text-base">{order.gift.name}</p>
            <p className="mt-0.5 flex items-center">
              <StarsIndicator
                value={order.pricePerItem}
                iconSize={{
                  width: 14,
                  height: 13,
                }}
                className="mr-1 text-base"
              />
              (x{order.quantity})
            </p>
            <p
              className="mt-0.5 font-mono cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() =>
                copyToClipboard(order.buyer.username || order.buyer.telegramId)
              }
            >
              @{order.buyer.username || order.buyer.telegramId}
            </p>
            {/* <p className="mt-0.5 text-[#eee]">Написать покупателю</p> */}
          </div>
        </div>
      </div>

      {/* Время создания */}
      <p
        className="py-3.5 text-sm flex items-center gap-2 px-2"
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom:
            order.status === "PENDING"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "none",
        }}
      >
        <Calendar />
        <span className="text-[#eee]">{formatTimeAgo(order.createdAt)}</span>
        {order.sentAt && (
          <span className="text-[#eee] ml-2">
            • Отправлено {formatTimeAgo(order.sentAt)}
          </span>
        )}
      </p>

      {/* Кнопки действий для ожидающих заказов */}
      {order.status === "PENDING" && (
        <>
          <style jsx>{`
            .cancel-btn:hover {
              background-color: rgba(239, 68, 68, 0.1) !important;
              color: #ef4444 !important;
            }
            .send-btn:hover {
              background-color: rgba(34, 197, 94, 0.1) !important;
              color: #22c55e !important;
            }
          `}</style>

          <div className="flex items-center justify-center gap-3 text-sm font-bold py-2">
            <button
              className="cancel-btn py-2.5 px-2 cursor-pointer transition-colors text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onCancel}
              disabled={isLoading}
            >
              🚫 Нет, отмена
            </button>
            <button
              className="send-btn py-2.5 px-2 cursor-pointer transition-colors text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onSend}
              disabled={isLoading}
            >
              🎁 Да, отправить
            </button>
          </div>
        </>
      )}
    </div>
  );
}
