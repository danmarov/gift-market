"use client";
import { useState } from "react";
import ProductCard from "./product-card";
import QuantitySelector from "./quantity-selector";
import { Gift } from "database";
import UserStarsIndicator from "@/components/widgets/user-stars-indicator";
import { useAuth } from "../auth/hooks/use-auth";
import Button from "@/components/ui/button";
import Link from "next/link";
import { Pen, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { hapticFeedback } from "@/lib/haptic-feedback";
import showToast from "@/components/ui/custom-toast";
// import { useQueryClient } from "@tanstack/react-query";

interface GiftPageContentProps {
  id: string;
  onQuantityChange: (quantity: number) => void;
  item: Gift;
}

export function GiftPageContent({
  id,
  onQuantityChange,
  item,
}: GiftPageContentProps) {
  const { user } = useAuth();
  const router = useRouter();
  // const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleDelete = async () => {
    // Подтверждение удаления
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const { deleteGift } = await import("@/lib/actions/gift/delete-gift");
      const result = await deleteGift(item.id);

      if (result.success) {
        console.log("✅ Gift deleted successfully");

        hapticFeedback("success");
        showToast.success("Подарок успешно удален");
        router.push("/shop");
      } else {
        console.error("❌ Delete failed:", result.error);
        hapticFeedback("error");
        showToast.error(result.error);
      }
    } catch (error) {
      console.error("💥 Delete error:", error);
      hapticFeedback("error");
      showToast.error("Произошла ошибка при удалении товара");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-fit ml-auto mb-5">
        <UserStarsIndicator />
      </div>
      <div className="relative">
        <ProductCard item={item} />
        <QuantitySelector
          currentQuantity={quantity}
          onQuantityChange={handleQuantityChange}
          presets={[10, 20, 50]}
          maxQuantity={item.quantity}
        />
        {user?.role === "ADMIN" && (
          <div className="absolute top-3 right-3 flex gap-2 z-20">
            <Link href={`/admin/gift/edit/${item.id}`}>
              <Button
                variant="secondary"
                style={{
                  padding: "9px 10px",
                }}
              >
                <Pen size={20} />
              </Button>
            </Link>

            <Button
              variant="secondary"
              onClick={handleDelete}
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
        )}
      </div>
    </>
  );
}
