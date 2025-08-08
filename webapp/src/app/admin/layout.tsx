import { AdminRoleGuard } from "@/components/features/auth/admin-role-guard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminRoleGuard>{children}</AdminRoleGuard>;
}
