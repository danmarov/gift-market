"use client";

import TelegramBackButton from "@/components/common/telegram-back-button";
import MainLayout from "@/components/layout/main-layout";
import React, { useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Button from "@/components/ui/button";
import ActionButton from "@/components/ui/action-button";
import ProductPreview from "@/components/features/product/product-preview";
import GiftSearch from "@/components/features/product/product-search";
import { searchGifts } from "@/lib/actions/gift/search-gifts";
import randomColor from "randomcolor";
import { saveRoulettePrizes } from "@/lib/actions/admin/save-roulette-prizes";
import { hapticFeedback } from "@/lib/haptic-feedback";
import showToast from "@/components/ui/custom-toast";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Prize {
  id: string;
  name: string;
  dropChance: number;
  color: string;
  maxWins: number;
  currentWins: number;
  isActive: boolean;
  mediaUrl?: string;
  price?: number;
  lootBoxPrizeId?: string;
}

interface Gift {
  id: string;
  name: string;
  mediaUrl: string;
  price: number;
}

const mockPrizes: Prize[] = [
  {
    id: "1",
    name: "Медвежонок",
    dropChance: 0.4,
    color: "#FF6B6B",
    maxWins: 100,
    currentWins: 23,
    isActive: true,
  },
  {
    id: "2",
    name: "Единорог",
    dropChance: 0.3,
    color: "#4ECDC4",
    maxWins: 50,
    currentWins: 12,
    isActive: true,
  },
  {
    id: "3",
    name: "Звездочка",
    dropChance: 0.2,
    color: "#45B7D1",
    maxWins: 30,
    currentWins: 8,
    isActive: true,
  },
  {
    id: "4",
    name: "Бриллиант",
    dropChance: 0.1,
    color: "#96CEB4",
    maxWins: 10,
    currentWins: 2,
    isActive: true,
  },
];

const RouletteChart: React.FC<{
  data: Prize[];
  togglePrizeActive: (prizeId: string) => void;
}> = ({ data, togglePrizeActive }) => {
  // Показываем ВСЕ призы, не только активные
  const allPrizes = data;

  const chartData = {
    labels: allPrizes.map((item) => item.name),
    datasets: [
      {
        // Для неактивных призов ставим 0, чтобы они не занимали место на диаграмме
        data: allPrizes.map((item) =>
          item.isActive ? item.dropChance * 100 : 0
        ),
        backgroundColor: allPrizes.map((item) =>
          item.isActive ? item.color : "rgba(255, 255, 255, 0.1)"
        ),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#ffffff",
          font: { size: 12 },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
          // Стилизуем неактивные элементы
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const prize = allPrizes[index];
                return {
                  text: label,
                  fillStyle: prize.isActive
                    ? prize.color
                    : "rgba(255, 255, 255, 0.1)",
                  strokeStyle: prize.isActive
                    ? prize.color
                    : "rgba(255, 255, 255, 0.1)",
                  lineWidth: 2,
                  pointStyle: "circle",
                  hidden: false,
                  index: index,
                  // Добавляем зачёркивание для неактивных
                  fontColor: prize.isActive
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.5)",
                  textDecoration: prize.isActive ? "none" : "line-through",
                };
              });
            }
            return [];
          },
        },
        onClick: (e: any, legendItem: any) => {
          // Находим приз по индексу из легенды
          const prizeIndex = legendItem.index;
          const prizeId = allPrizes[prizeIndex]?.id;

          if (prizeId) {
            togglePrizeActive(prizeId);
          }
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        // Показываем тултип только для активных элементов
        filter: function (tooltipItem: any) {
          return allPrizes[tooltipItem.dataIndex].isActive;
        },
      },
      datalabels: {
        display: true,
        color: "#ffffff",
        font: { weight: "bold" as const, size: 14 },
        formatter: (value: number, context: any) => {
          // Показываем проценты только для активных призов
          const prize = allPrizes[context.dataIndex];
          return prize.isActive && value > 0 ? `${value.toFixed(1)}%` : "";
        },
        textAlign: "center" as const,
        anchor: "center" as const,
        align: "center" as const,
      },
    },
    animation: {
      animateRotate: true,
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
    cutout: "40%",
  };

  return (
    <div style={{ width: "100%", height: "320px" }}>
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

interface RoulettePageClientProps {
  initialPrizes: Prize[];
  searchGiftsAction: typeof searchGifts;
  saveRoulettePrizesAction: typeof saveRoulettePrizes;
}
// Функция для пересчёта шансов пропорционально
const redistributeChances = (prizes: Prize[]): Prize[] => {
  const activePrizes = prizes.filter((prize) => prize.isActive);

  if (activePrizes.length === 0) return prizes;
  if (activePrizes.length === 1) {
    return prizes.map((prize) =>
      prize.isActive ? { ...prize, dropChance: 1 } : prize
    );
  }

  // Пересчитываем пропорционально
  const totalCurrentChance = activePrizes.reduce(
    (sum, prize) => sum + prize.dropChance,
    0
  );

  if (totalCurrentChance === 0) {
    // Если все шансы были 0, распределяем равномерно
    const equalChance = 1 / activePrizes.length;
    return prizes.map((prize) =>
      prize.isActive ? { ...prize, dropChance: equalChance } : prize
    );
  }

  // Нормализуем до 100%
  return prizes.map((prize) => {
    if (!prize.isActive) return prize;
    return {
      ...prize,
      dropChance: prize.dropChance / totalCurrentChance,
    };
  });
};

export default function RoulettePageClient({
  initialPrizes,
  searchGiftsAction,
  saveRoulettePrizesAction,
}: RoulettePageClientProps): React.ReactElement {
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes);
  const [searchResults, setSearchResults] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const excludeIds = useMemo(() => {
    return prizes.map((prize) => prize.id);
  }, [prizes]);
  const totalChance = prizes
    .filter((prize) => prize.isActive)
    .reduce((sum, prize) => sum + prize.dropChance, 0);

  const isValidTotal = Math.abs(totalChance - 1) < 0.001;

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Подготавливаем данные для сохранения
      const prizesToSave = prizes.map((prize) => ({
        id: prize.id, // ID подарка
        lootBoxPrizeId: prize.lootBoxPrizeId,
        dropChance: prize.dropChance,
        isActive: prize.isActive,
        maxWins: prize.maxWins,
        currentWins: prize.currentWins,
        color: prize.color,
      }));

      const result = await saveRoulettePrizesAction(prizesToSave);

      if (result.success) {
        console.log("Призы успешно сохранены!");
        hapticFeedback("success");
        showToast.success("Призы успешно сохранены");
        // Можно показать уведомление об успехе
      } else {
        console.error("Ошибка сохранения:", result.error);
        // Можно показать уведомление об ошибке
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleResultsChange = (results: Gift[]) => {
    setSearchResults(results);
  };

  const addToRoulette = (gift: Gift) => {
    // Создаем новый приз из подарка
    const newPrize: Prize = {
      id: gift.id,
      name: gift.name,
      dropChance: 0.1, // Начальный шанс 10%
      color: randomColor({ luminosity: "bright", format: "hex" }),
      maxWins: 100000,
      currentWins: 0,
      isActive: true,
      mediaUrl: gift.mediaUrl,
      price: gift.price,
    };

    // Добавляем новый приз и пересчитываем шансы
    setPrizes((prev) => {
      const updatedPrizes = [...prev, newPrize];
      return redistributeChances(updatedPrizes);
    });

    // Убираем из результатов поиска без ревалидации
    setSearchResults((prev) => prev.filter((item) => item.id !== gift.id));

    console.log("Добавлен подарок в рулетку:", newPrize);
  };

  const removePrize = (prizeId: string) => {
    setPrizes((prev) => {
      const filteredPrizes = prev.filter((prize) => prize.id !== prizeId);
      return redistributeChances(filteredPrizes);
    });
  };

  const updatePrizeChance = (prizeId: string, newChance: number) => {
    // Просто обновляем значение без пересчёта пропорций
    setPrizes((prev) =>
      prev.map((prize) =>
        prize.id === prizeId ? { ...prize, dropChance: newChance / 100 } : prize
      )
    );
  };

  const togglePrizeActive = (prizeId: string) => {
    setPrizes((prev) => {
      const updatedPrizes = prev.map((prize) =>
        prize.id === prizeId ? { ...prize, isActive: !prize.isActive } : prize
      );
      return redistributeChances(updatedPrizes);
    });
  };

  return (
    <MainLayout
      bottomBar={
        <ActionButton
          onClick={handleSave}
          disabled={!isValidTotal}
          isLoading={isLoading}
        >
          {isLoading
            ? "Сохраняем..."
            : isValidTotal
            ? "Сохранить настройки"
            : `Исправьте сумму шансов(${(totalChance * 100).toFixed(1)}%)`}
        </ActionButton>
      }
    >
      <TelegramBackButton />

      <h1 className="uppercase font-sans italic text-4xl font-bold text-center mt-4">
        РУЛЕТКА
      </h1>

      <p className="text-[#E7D3E9] font-sans text-center text-[15px] mt-1 leading-[22px]">
        Настройте шансы выпадения подарков в розыгрыше. Сумма всех шансов должна
        равняться 100%
      </p>

      {prizes.length > 0 && (
        <div className="mt-2">
          <RouletteChart data={prizes} togglePrizeActive={togglePrizeActive} />
        </div>
      )}
      {/* 
      {prizes.length === 0 && (
        <div className="mt-2 text-center py-8">
          <div className="text-white/40 text-lg mb-2">🎯</div>
          <p className="text-white/60 text-sm">Рулетка пуста</p>
          <p className="text-white/40 text-xs mt-1">
            Добавьте подарки через поиск ниже
          </p>
        </div>
      )} */}
      {/* Поиск подарка */}
      <div className="mt-2">
        <h3 className="text-white font-semibold text-lg mb-4">
          Добавить подарок
        </h3>
        <GiftSearch
          placeholder="Поиск подарка по названию..."
          onResultsChange={handleResultsChange}
          excludeIds={excludeIds}
          searchAction={searchGiftsAction}
        />

        {/* Результаты поиска - показываем только если есть результаты */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((gift) => (
              <div
                key={gift.id}
                className="rounded-md p-3 flex items-center justify-between"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-12 rounded-md relative overflow-hidden"
                    style={{
                      background: "rgba(255,255,255, 0.1)",
                    }}
                  >
                    <ProductPreview src={gift.mediaUrl} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{gift.name}</p>
                    <p
                      className="text-sm"
                      style={{
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {gift.price} звезд
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToRoulette(gift)}
                >
                  Добавить
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Список призов */}
      <div className="mt-8">
        <h3 className="text-white font-semibold text-lg mb-4">
          Призы в рулетке ({prizes.length})
        </h3>

        <div className="flex flex-col gap-2">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="bg-white/5 rounded-2xl p-4"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                opacity: prize.isActive ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="size-14 rounded-md relative p-1"
                    style={{
                      backgroundColor: prize.color,
                    }}
                  >
                    <ProductPreview
                      src={
                        prize.mediaUrl ||
                        "https://cdn.changes.tg/gifts/originals/5170233102089322756/Original.tgs"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{prize.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white/60 text-sm">
                        Выиграно: {prize.currentWins}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={`${(prize.dropChance * 100).toFixed(1)}%`}
                    onChange={(e) => {
                      const value = e.target.value.replace("%", "");
                      const numValue = parseFloat(value);
                      if (
                        !isNaN(numValue) &&
                        numValue >= 0 &&
                        numValue <= 100
                      ) {
                        updatePrizeChance(prize.id, numValue);
                      }
                    }}
                    className="font-bold text-sm outline-none block w-16 text-center bg-transparent text-white border border-white/20 rounded px-2 py-1"
                    disabled={!prize.isActive}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removePrize(prize.id)}
                      style={{ color: "#ff6b6b" }}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
