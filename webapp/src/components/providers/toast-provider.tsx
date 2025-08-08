"use client";
import { viewport } from "@telegram-apps/sdk-react";
import { Toaster } from "react-hot-toast";
import React from "react";
import { useDevice } from "./device-provider";

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { isMobile } = useDevice();
  const topPadding = isMobile
    ? `${viewport.safeAreaInsetTop() + 100}px`
    : `${viewport.safeAreaInsetTop() + 20}px`;
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: topPadding,
          zIndex: "1000",
        }}
        toastOptions={{
          duration: 1000,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            margin: 0,
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
