"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Создаем портал контейнер при монтировании
  useEffect(() => {
    const portalContainer = document.createElement("div");
    portalContainer.id = "modal-portal";
    document.body.appendChild(portalContainer);
    portalRef.current = portalContainer;

    return () => {
      if (portalContainer && document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
    };
  }, []);

  // Блокируем скролл body когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalRef.current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose} // Закрытие по клику на backdrop
    >
      {/* Backdrop - черный полупрозрачный фон */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Контейнер для контента - ограничиваем размером как твой лейаут */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Контент модалки */}
        <div
          className="relative w-full max-h-[80vh] overflow-auto rounded-2xl border border-white/30 p-6 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(215, 83, 198, 0.95) 0%, rgba(128, 50, 121, 0.95) 100%)",
            backdropFilter: "blur(20px)",
          }}
          onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике по контенту
        >
          {/* Крестик для закрытия */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full  bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Закрыть модальное окно"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Контент */}
          <div className="">
            {/* Отступ справа для крестика */}
            {children}
          </div>
        </div>
      </div>
    </div>,
    portalRef.current
  );
}
