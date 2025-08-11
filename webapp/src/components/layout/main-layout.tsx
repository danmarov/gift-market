"use client";
import React, { PropsWithChildren, ReactNode } from "react";
import { cn } from "@sglara/cn";
import { useDevice } from "../providers/device-provider";
import { viewport } from "@telegram-apps/sdk-react";

interface MainLayoutProps extends PropsWithChildren {
  bottomBar?: ReactNode;
  disableBottomPadding?: boolean;
  classname?: string;
}

export default function MainLayout({
  children,
  bottomBar,
  disableBottomPadding,
  classname = "",
}: MainLayoutProps) {
  const { isMobile } = useDevice();

  const topPadding = isMobile
    ? `${viewport.safeAreaInsetTop() + 55}px`
    : `${viewport.safeAreaInsetTop() + 20}px`;

  const bottomPadding = disableBottomPadding
    ? isMobile
      ? "55px"
      : "20px"
    : isMobile
    ? "128px"
    : "95px";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <main
        style={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        }}
        className={cn(
          `flex-1 max-w-lg mx-auto overflow-auto gradient px-4 w-full relative`,
          classname
        )}
      >
        {children}
      </main>

      {bottomBar && (
        <footer className="relative">
          <div className="fixed bottom-0 z-40 left-1/2 -translate-x-1/2 w-full bottom-bar-backdrop max-w-lg">
            <div className="mx-auto h-full w-full max-w-screen-md">
              {bottomBar}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
