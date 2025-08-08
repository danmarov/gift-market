// app/admin/roulette/page.tsx
import RoulettePageClient from "@/components/features/roulette/roulette-page-client";
import { getRoulettePrizes } from "@/lib/actions/admin/get-roulette-prizes";
import { saveRoulettePrizes } from "@/lib/actions/admin/save-roulette-prizes";
import { searchGifts } from "@/lib/actions/gift/search-gifts";

// Функция для трансформации данных из БД в формат Prize
function transformPrizesToClientFormat(dbPrizes: any[]) {
  return dbPrizes.map((prize) => ({
    id: prize.gift.id,
    name: prize.gift.name,
    dropChance: prize.dropChance,
    color: prize.color,
    maxWins: prize.maxWins,
    currentWins: prize.currentWins,
    isActive: prize.isActive,
    mediaUrl: prize.gift.mediaUrl,
    price: prize.gift.price,
    lootBoxPrizeId: prize.id,
  }));
}

export default async function RoulettePage() {
  const result = await getRoulettePrizes();

  if (!result.success) {
    return <div>Ошибка: {result.error}</div>;
  }

  const transformedPrizes = transformPrizesToClientFormat(result.data || []);

  return (
    <RoulettePageClient
      initialPrizes={transformedPrizes}
      searchGiftsAction={searchGifts}
      saveRoulettePrizesAction={saveRoulettePrizes}
    />
  );
}
