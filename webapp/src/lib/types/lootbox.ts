// lib/types/lootbox.ts
export interface LootBoxTask {
  id: string;
  title: string;
  description?: string | null;
  icon: string;
  channelId: string;
  chatId?: string | null;
  channelUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLootBoxTaskData {
  title: string;
  description?: string;
  icon?: string;
  channelId: string;
  chatId?: string;
  channelUrl: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateLootBoxTaskData {
  title?: string;
  description?: string;
  icon?: string;
  channelId?: string;
  chatId?: string;
  channelUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Для форм
export interface CreateLootBoxTaskFormData {
  title: string;
  description?: string;
  icon: string;
  channel_url: string;
  chat_id?: string;
  sort_order: number;
  is_active: boolean;
}

export interface UpdateLootBoxTaskFormData {
  title?: string;
  description?: string;
  icon?: string;
  channel_url?: string;
  chat_id?: string;
  sort_order?: number;
  is_active?: boolean;
}
