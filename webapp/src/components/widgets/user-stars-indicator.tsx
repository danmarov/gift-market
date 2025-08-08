"use client";

import { useAuth } from "../features/auth/hooks/use-auth";
import StarsIndicator from "../ui/stars-indicator";

export default function UserStarsIndicator() {
  const { user } = useAuth();
  return (
    <StarsIndicator value={user?.balance || 0} className="stars-indicator" />
  );
}
