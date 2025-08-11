export interface PurchaseWithDetails {
  id: number;
  buyerId: string;
  giftId: string;
  quantity: number;
  totalPrice: number;
  pricePerItem: number;
  status: "PENDING" | "SENT" | "CANCELLED";
  adminNotes: string | null;
  sentAt: Date | null; // Убрали ? - поле обязательное, но может быть null
  telegramMessageId: number | null; // Убрали ? - поле обязательное, но может быть null
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    firstName: string | null;
    username: string | null;
    telegramId: string;
  };
  gift: {
    name: string;
    mediaUrl: string;
    telegramGiftId: string | null;
  };
}

export interface PurchasesByStatus {
  pending: PurchaseWithDetails[];
  history: PurchaseWithDetails[];
}

export type TabType = "PENDING" | "HISTORY";
