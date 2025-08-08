// components/features/lootbox/lootbox-task-card.tsx
"use client";

import { cn } from "@sglara/cn";
import React from "react";

interface LootBoxTask {
  id: string;
  title: string;
  description?: string;
  icon: string;
  channelUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface LootBoxTaskCardProps {
  task: LootBoxTask;
  onEdit?: (task: LootBoxTask) => void;
  onDelete?: (taskId: string) => void;
  className?: string;
}

const icons = {
  telegram: "📱",
  youtube: "📺",
  instagram: "📷",
  twitter: "🐦",
  tiktok: "🎵",
};

export default function LootBoxTaskCard({
  task,
  onEdit,
  onDelete,
  className,
}: LootBoxTaskCardProps) {
  return (
    <div
      className={cn(
        "bg-white/5 rounded-2xl p-4 border border-white/10",
        !task.isActive && "opacity-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {icons[task.icon as keyof typeof icons] || "📱"}
          </span>
          <div>
            <h3 className="text-white font-medium">{task.title}</h3>
            {task.description && (
              <p className="text-white/60 text-sm">{task.description}</p>
            )}
            <p className="text-white/40 text-xs mt-1">
              Порядок: {task.sortOrder} •{" "}
              {task.isActive ? "Активно" : "Неактивно"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(task)}
            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30"
          >
            Изменить
          </button>
          <button
            onClick={() => onDelete?.(task.id)}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
