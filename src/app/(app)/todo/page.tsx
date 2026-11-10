import type { Metadata } from "next";
import { TodoView } from "@/components/views/todo-view";

export const metadata: Metadata = { title: "To-do List" };

export default function TodoPage() {
  return <TodoView />;
}
