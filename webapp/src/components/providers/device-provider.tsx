// providers/device-provider.tsx
"use client";
import { createContext, useContext, ReactNode } from "react";

interface DeviceContextType {
  userAgent: string;
  isMobile: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  userAgent: "",
  isMobile: true,
});

interface DeviceProviderProps {
  children: ReactNode;
  userAgent: string;
}

export default function DeviceProvider({
  children,
  userAgent,
}: DeviceProviderProps) {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );

  return (
    <DeviceContext.Provider value={{ userAgent, isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within DeviceProvider");
  }
  return context;
}
