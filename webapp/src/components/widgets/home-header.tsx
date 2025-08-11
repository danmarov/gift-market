"use client";
import Link from "next/link";
import React from "react";
import UserStarsIndicator from "./user-stars-indicator";
import { useAuth } from "../features/auth/hooks/use-auth";

export default function HomeHeader() {
  const { user } = useAuth();
  return (
    <div className="flex justify-between items-center">
      {user?.role === "ADMIN" ? (
        <Link
          className="menu-btn px-[10px] py-[4.5px] font-medium font-mono"
          href={"/admin/demo"}
        >
          Как играть?
        </Link>
      ) : (
        <Link
          className="menu-btn px-[10px] py-[4.5px] font-medium font-mono"
          href={"/"}
        >
          Как играть?
        </Link>
      )}
      <UserStarsIndicator />
    </div>
  );
}
