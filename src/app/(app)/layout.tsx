import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ensureUserSetup } from "@/lib/onboarding";
import { toSettingsDTO } from "@/lib/serializers";
import { nowMinutes, todayKey } from "@/lib/dates";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const settings = toSettingsDTO(await ensureUserSetup(session.user.id));
  const now = new Date();

  return (
    <AppShell
      settings={settings}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      initialToday={todayKey(settings.timezone, now)}
      initialMinutes={nowMinutes(settings.timezone, now)}
    >
      {children}
    </AppShell>
  );
}
