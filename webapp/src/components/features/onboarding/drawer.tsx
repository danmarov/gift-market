"use client";
import { useDevice } from "@/components/providers/device-provider";
import showToast from "@/components/ui/custom-toast";
import { claimGift } from "@/lib/actions/lootbox/claim-gift";
import { getActiveLootBoxTasks } from "@/lib/actions/lootbox/get-active-lootbox-tasks";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { openLink, openTelegramLink } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import React, {
  cloneElement,
  useState,
  isValidElement,
  useEffect,
} from "react";
import Drawer from "react-modern-drawer";
import { AUTH_QUERY_KEY, useAuth } from "../auth/hooks/use-auth";
import { ExternalLink, PersonStanding, Share2 } from "lucide-react";
import { shareRefferalLink } from "@/lib/utils/share-refferal-link";
import { validateRefferal } from "@/lib/actions/user/validate-refferal";

interface SubscriptionDrawerProps {
  trigger?: React.ReactElement; // Делаем опциональным
  isOpen?: boolean; // Контролируемое состояние
  onOpenChange?: (isOpen: boolean) => void; // Callback для изменения состояния
}

const SubscriptionDrawer: React.FC<SubscriptionDrawerProps> = ({
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { isMobile } = useDevice();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["drawer-tasks"],
    queryFn: getActiveLootBoxTasks,
  });

  // Определяем какое состояние использовать: контролируемое или внутреннее
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const handleShare = () => {
    shareRefferalLink(user?.telegramId);
  };
  const setIsOpen = (newIsOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newIsOpen);
    } else {
      setInternalIsOpen(newIsOpen);
    }
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const renderTrigger = () => {
    if (!trigger || !isValidElement(trigger)) return null;

    const triggerElement = trigger as React.ReactElement<
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >;

    return cloneElement(triggerElement, {
      onClick: toggleDrawer,
      disabled: isLoading || triggerElement.props.disabled,
      style: {
        ...(triggerElement.props.style || {}),
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? "none" : "auto",
      },
    });
  };

  // Динамические размеры на основе количества задач
  const getDrawerSizes = (tasksCount: number) => {
    const actualTasks = tasksCount || 0;

    // Базовые размеры для 6 задач
    const baseDrawerSize = 500;
    const baseTasksHeight = 312;
    const baseTasks = 6;

    // Высота одной задачи 56px + отступ 8px = 64px на задачу
    // Но последняя задача без отступа, поэтому: (tasks * 56) + ((tasks - 1) * 8)
    const taskHeight = 56;
    const gapHeight = 8;

    const calculateTasksHeight = (tasks: number) => {
      if (tasks === 0) return 0;
      return tasks * taskHeight + (tasks - 1) * gapHeight;
    };

    // Если задач меньше 6, используем их количество
    // Если больше 6, оставляем скролл и базовую высоту
    const tasksToCalculate = Math.min(actualTasks, baseTasks);
    const newTasksHeight =
      actualTasks <= baseTasks
        ? calculateTasksHeight(tasksToCalculate)
        : baseTasksHeight;

    // Рассчитываем разницу в высоте
    const baseCalculatedHeight = calculateTasksHeight(baseTasks); // должно быть примерно 312
    const heightDifference = newTasksHeight - baseCalculatedHeight;
    const newDrawerSize = baseDrawerSize + heightDifference;

    return {
      drawerSize: newDrawerSize,
      tasksHeight: newTasksHeight,
    };
  };

  // Если нет данных и загрузка - показываем только trigger (если есть)
  if (isLoading && !data) {
    return trigger ? renderTrigger() : null;
  }

  // Показываем ошибку от сервера с подробностями
  if (data && !data.success) {
    return (
      <>
        {trigger && renderTrigger()}
        <div>Server Error: {data.error || "Unknown error"}</div>
      </>
    );
  }

  if (!data?.data) {
    return (
      <>
        {trigger && renderTrigger()}
        <div>No data received: {JSON.stringify(data)}</div>
      </>
    );
  }

  const { drawerSize, tasksHeight } = getDrawerSizes(data.data.tasks.length);

  const onTaskClick = (url: string) => {
    validateRefferal();
    if (!isMobile) {
      return openLink(url);
    }
    if (openTelegramLink.isAvailable()) {
      openTelegramLink(url);
    } else {
      openLink(url);
    }
  };

  const handleClaimGift = async () => {
    setIsVerifying(true);

    try {
      const result = await claimGift();

      if (result.success) {
        // await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        // setIsOpen(false);
        // showToast.success(result.message); // Показываем сообщение об успехе из result
        // hapticFeedback("success");
        // router.push("/");
      } else {
        // Если есть missingSubscriptions, формируем сообщение о неподписанных каналах
        if (
          result.missingSubscriptions &&
          result.missingSubscriptions.length > 0
        ) {
          const channels = result.missingSubscriptions.join(", ");
          showToast.error(`Подпишитесь на все каналы`);
        } else {
          // Показываем конкретную ошибку из result.error
          showToast.error(result.error);
        }
        hapticFeedback("error");
      }
    } catch (error) {
      // Обработка непредвиденных ошибок (например, сетевые сбои)
      showToast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при получении подарка"
      );
      hapticFeedback("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Показываем trigger только если он передан */}
      {trigger && renderTrigger()}

      <Drawer
        open={isOpen}
        onClose={handleClose}
        direction="bottom"
        className="drawer"
        key={"subscription-drawer"}
        size={isMobile ? drawerSize + 80 : drawerSize + 60}
        style={{
          background: "#96418D",
          borderRadius: "16px 16px 0 0",
          paddingTop: "16px",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: isMobile ? "29px" : "8px",
          maxWidth: "512px",
          margin: "0 auto",
        }}
      >
        <div className="inset-0 relative">
          <h1 className="subscribtion-title font-mono text-left">
            Выполните задания
          </h1>
          <p className="subscription-p mt-1 text-left">
            Для того чтобы забрать подарок, сначала подпишитесь на наши каналы и
            пригласите 2 друзей.
          </p>
          <p className="subscription-p mt-5 text-left">Список заданий </p>
          <button className="absolute top-0 right-0" onClick={handleClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g clipPath="url(#clip0_58_361)">
                <path
                  d="M16.1481 3.38268C15.7884 3.02298 15.2052 3.02298 14.8455 3.38268L3.3827 14.8455C3.023 15.2052 3.023 15.7884 3.3827 16.1481C3.7424 16.5078 4.32559 16.5078 4.68529 16.1481L16.1481 4.68528C16.5078 4.32557 16.5078 3.74238 16.1481 3.38268Z"
                  fill="white"
                />
                <path
                  d="M4.68529 3.38268C4.32559 3.02298 3.7424 3.02298 3.3827 3.38268C3.023 3.74238 3.023 4.32557 3.3827 4.68528L14.8455 16.1481C15.2052 16.5078 15.7884 16.5078 16.1481 16.1481C16.5078 15.7884 16.5078 15.2052 16.1481 14.8455L4.68529 3.38268Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_58_361">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>

        <div
          className="mt-2 flex flex-col gap-2 overflow-auto"
          style={{ height: `${tasksHeight}px` }}
        >
          <div
            // key={i}
            className={cn("task-card-backdrop")}
            role="button"
            onClick={handleShare}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="task-card-icon flex-shrink-0">
                  <Share2 size={18} className="text-white" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-medium text-white text-left">
                    Пригласите друзей
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-auto text-[#e7d2e9] font-medium text-sm">
                {data.data.referals}/2
              </div>
            </div>
          </div>
          {data.data.tasks.map((item, i) => (
            <div
              key={i}
              className={cn("task-card-backdrop")}
              role="button"
              onClick={() => onTaskClick(item.channelUrl)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="task-card-icon flex-shrink-0">
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
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm font-medium text-white text-left">
                      {item.title}
                    </span>
                    <span className="text-sans text-xs text-[#E7D3E9] leading-3 text-left">
                      {/* {item.description} */}
                      {item.channelUrl}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <path
                      d="M21.1933 9.08407L17.6458 5.49991C17.5606 5.41399 17.4592 5.3458 17.3475 5.29926C17.2358 5.25272 17.116 5.22876 16.995 5.22876C16.874 5.22876 16.7542 5.25272 16.6425 5.29926C16.5308 5.3458 16.4294 5.41399 16.3442 5.49991C16.1734 5.67166 16.0776 5.90399 16.0776 6.14616C16.0776 6.38833 16.1734 6.62066 16.3442 6.79241L19.6075 10.0832H0.916667C0.673552 10.0832 0.440394 10.1798 0.268485 10.3517C0.0965771 10.5236 0 10.7568 0 10.9999C0 11.243 0.0965771 11.4762 0.268485 11.6481C0.440394 11.82 0.673552 11.9166 0.916667 11.9166H19.6625L16.3442 15.2257C16.2583 15.311 16.1901 15.4123 16.1435 15.524C16.097 15.6358 16.073 15.7556 16.073 15.8766C16.073 15.9976 16.097 16.1174 16.1435 16.2291C16.1901 16.3408 16.2583 16.4422 16.3442 16.5274C16.4294 16.6133 16.5308 16.6815 16.6425 16.7281C16.7542 16.7746 16.874 16.7986 16.995 16.7986C17.116 16.7986 17.2358 16.7746 17.3475 16.7281C16.4592 16.6815 17.5606 16.6133 17.6458 16.5274L21.1933 12.9707C21.7083 12.4551 21.9976 11.7562 21.9976 11.0274C21.9976 10.2987 21.7083 9.5997 21.1933 9.08407Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 mt-2.5">
          <button
            className="subscription-secondary font-mono"
            disabled={isVerifying}
            onClick={handleClose}
          >
            Закрыть
          </button>
          <button
            className="subscription-primary font-mono"
            onClick={handleClaimGift}
            disabled={isVerifying}
          >
            {isVerifying ? "Проверяем..." : "Проверить"}
          </button>
        </div>
      </Drawer>
    </>
  );
};

export default SubscriptionDrawer;
