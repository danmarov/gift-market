// page.tsx
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

    console.log("🔍 [SERVER] Received edit data:", {
      ...data,
      revealAnimationFile: data.revealAnimationFile
        ? {
            name: data.revealAnimationFile.name,
            size: data.revealAnimationFile.size,
            type: data.revealAnimationFile.type,
          }
        : null,
    });

    const editData = {
      id: result.data.id,
      name: data.name,
      description: data.description,
      telegramGiftId: data.telegramGiftId,
      mediaUrl: data.mediaUrl,
      revealAnimationFile: data.revealAnimationFile,
      deleteRevealAnimation: data.deleteRevealAnimation,
      price: data.price,
      quantity: data.quantity,
      backdropVariant: data.backdropVariant,
      tags: data.tags,
      specialOffer: data.specialOffer,
    };

    console.log("🔍 [SERVER] Prepared editData:", {
      ...editData,
      revealAnimationFile: editData.revealAnimationFile ? "File object" : null,
    });

    return await editGift(editData);
  };

  return <EditPageWrapper gift={result.data} onEditGift={handleEditGift} />;
}
