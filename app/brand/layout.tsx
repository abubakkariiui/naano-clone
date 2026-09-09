import { AppShell } from "@/components/AppShell";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <AppShell side="brand">{children}</AppShell>;
}
