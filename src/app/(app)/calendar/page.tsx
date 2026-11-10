import type { Metadata } from "next";
import { CalendarView } from "@/components/views/calendar-view";
import { isDateKey } from "@/lib/dates";
import type { CalendarView as View } from "@/lib/types";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; date?: string | string[] }>;
}) {
  const { view, date } = await searchParams;
  const initialView: View | null = view === "day" || view === "week" || view === "month" ? view : null;
  return <CalendarView initialView={initialView} initialDate={typeof date === "string" && isDateKey(date) ? date : null} />;
}
