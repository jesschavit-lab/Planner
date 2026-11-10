import type { Metadata } from "next";
import { MyDayView } from "@/components/views/my-day-view";
import { isDateKey } from "@/lib/dates";

export const metadata: Metadata = { title: "My Day" };

export default async function MyDayPage({ searchParams }: { searchParams: Promise<{ date?: string | string[] }> }) {
  const { date } = await searchParams;
  return <MyDayView initialDate={typeof date === "string" && isDateKey(date) ? date : null} />;
}
