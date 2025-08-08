"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Input from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Gift {
  id: string;
  name: string;
  mediaUrl: string;
  price: number;
}

interface GiftSearchProps {
  placeholder?: string;
  onResultsChange?: (results: Gift[]) => void;
  excludeIds?: string[];
  minQueryLength?: number;
  searchAction: (
    query: string,
    excludeIds?: string[]
  ) => Promise<{
    success: boolean;
    data?: Gift[];
    error?: string;
  }>;
}

// Хук для дебаунса
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const GiftSearch: React.FC<GiftSearchProps> = ({
  placeholder = "Поиск подарка по названию...",
  onResultsChange,
  excludeIds = [],
  minQueryLength = 2,
  searchAction,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // React Query для поиска
  const {
    data: searchResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gift-search", debouncedQuery],
    queryFn: async () => {
      return await searchAction(debouncedQuery, excludeIds);
    },
    enabled: debouncedQuery.length >= minQueryLength,
    staleTime: 5 * 60 * 1000, // 5 минут кеша
    gcTime: 10 * 60 * 1000, // 10 минут в памяти
  });

  // Обновляем результаты когда есть данные
  useEffect(() => {
    if (searchResult?.success && searchResult.data) {
      // Фильтруем исключённые ID на фронте для избежания ревалидации
      const filteredResults = searchResult.data.filter(
        (gift) => !excludeIds.includes(gift.id)
      );
      onResultsChange?.(filteredResults);
    } else if (debouncedQuery.length < minQueryLength) {
      // Очищаем результаты если запрос слишком короткий
      onResultsChange?.([]);
    }
  }, [searchResult, excludeIds, debouncedQuery.length, minQueryLength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < minQueryLength) {
      onResultsChange?.([]);
    }
  };

  return (
    <div>
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        suffix={isLoading ? <Loader2 className="animate-spin" /> : undefined}
      />
      {error && (
        <p className="text-red-400 text-sm mt-2">
          Ошибка поиска: {error.message}
        </p>
      )}
    </div>
  );
};

export default GiftSearch;
