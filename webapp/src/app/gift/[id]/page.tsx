// app/gift/[id]/page.tsx
import GiftPageWrapper from "@/components/features/product/gift-page-wrapper";
import { findGift } from "@/lib/actions/gift/find-gift-by-id";
import { createPurchase } from "@/lib/actions/purchases/create-purchase";

interface GiftPageProps {
  params: Promise<{ id: string }>;
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { id } = await params;
  const result = await findGift(id);

  if (!result.success) {
    return <>{result.error}</>;
  }

  const handlePurchase = async (giftId: string, quantity: number) => {
    "use server";

    try {
      const result = await createPurchase({
        giftId,
        quantity,
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Purchase failed",
      };
    }
  };

  return (
    <GiftPageWrapper id={id} item={result.data} onPurchase={handlePurchase} />
  );
}
