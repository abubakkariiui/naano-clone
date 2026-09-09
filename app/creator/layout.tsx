import { AppShell } from "@/components/AppShell";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell side="creator">{children}</AppShell>;
}
