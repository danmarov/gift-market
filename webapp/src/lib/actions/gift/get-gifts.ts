import { findGifts, Gift } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";

export type GetGiftsResult =
  | {
      success: true;
      data: {
        catalog: Gift[];
        specialOffers: Gift[];
        hasMore: boolean;
        isAdmin: boolean;
      };
    }
  | { success: false; error: string };

async function _getGifts(
  session: JWTSession,
  options?: {
    skip?: number;
    take?: number;
  }
): Promise<GetGiftsResult> {
  try {
    const take = options?.take || 20;
    const skip = options?.skip || 0;

    // Получаем основной каталог с пагинацией
    const catalogGifts = await findGifts({
      skip,
      take: take + 1, // +1 чтобы понять есть ли еще товары
      available: true, // Только доступные товары
    });

    // Получаем первые 5 товаров со special offer
    const specialOfferGifts = await findGifts({
      specialOffer: true,
      take: 5,
      available: true,
    });

    // Проверяем есть ли еще товары для пагинации
    const hasMore = catalogGifts.length > take;
    const catalog = hasMore ? catalogGifts.slice(0, take) : catalogGifts;

    return {
      success: true,
      data: {
        catalog,
        specialOffers: specialOfferGifts,
        hasMore,
        isAdmin: session.role === "ADMIN",
      },
    };
  } catch (error) {
    console.error("Error fetching gifts:", error);
    return { success: false, error: "Failed to fetch gifts" };
  }
}

export const getGifts = withServerAuth(_getGifts);
