import EditPageWrapper from "@/components/features/admin/product/edit/edit-page-wrapper";
import { findGift } from "@/lib/actions/gift/find-gift-by-id";
import { editGift } from "@/lib/actions/admin/edit-gift";
import { EditGiftFormData } from "@/lib/types/gift";
import React from "react";
import { notFound } from "next/navigation";

interface EditGiftPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGiftPage({ params }: EditGiftPageProps) {
  const { id } = await params;
  const result = await findGift(id);

  if (!result.success) {
    return notFound();
  }

  // Server action wrapper
  const handleEditGift = async (data: EditGiftFormData) => {
    "use server";

    console.log("🔍 [SERVER] Received data:", data);

    const editData = {
      id: result.data.id,
      name: data.name,
      description: data.description,
      telegramGiftId: data.telegramGiftId, // snake_case -> camelCase
      mediaUrl: data.mediaUrl, // snake_case -> camelCase
      price: data.price,
      quantity: data.quantity,
      backdropVariant: data.backdropVariant.toUpperCase() as "YELLOW" | "BLUE", // snake_case -> camelCase + uppercase
      tags: data.tags,
      specialOffer: data.specialOffer, // snake_case -> camelCase
    };

    console.log("🔍 [SERVER] Prepared editData:", editData);
    console.log(
      "🔍 [SERVER] backdrop_variant type:",
      typeof editData.backdropVariant
    );
    console.log(
      "🔍 [SERVER] backdrop_variant value:",
      editData.backdropVariant
    );

    return await editGift(editData);
  };

  return <EditPageWrapper gift={result.data} onEditGift={handleEditGift} />;
}
