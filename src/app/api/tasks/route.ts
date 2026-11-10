import { prisma } from "@/lib/prisma";
import { HttpError, parseWith, readJson, userToday, withUser } from "@/lib/api-server";
import { diffDays, isDateKey, zonedDayRange } from "@/lib/dates";
import { taskInclude, toTaskDTO } from "@/lib/serializers";
import { createTaskForUser } from "@/lib/task-service";
import {
  TASK_SORTS,
  TASK_VIEWS,
  alertsWhere,
  dayListWhere,
  listOrderBy,
  listWhere,
  rangeWhere,
  type TaskSort,
  type TaskView,
} from "@/lib/task-queries";
import { taskCreateSchema } from "@/lib/validation";

/**
 * GET /api/tasks
 *   ?day=YYYY-MM-DD           a day's list (see dayListWhere)
 *   ?from=…&to=…              tasks planned or due in a range (max 62 days)
 *   ?alerts=1                 open tasks that are overdue, due soon or have a reminder coming up
 *   ?view=…&q=&categoryId=&priority=&status=&sort=&limit=   the To-do List
 */
export const GET = withUser(async (req, userId) => {
  const params = new URL(req.url).searchParams;
  const { today, timezone } = await userToday(userId);

  const day = params.get("day");
  if (day !== null) {
    if (!isDateKey(day)) throw new HttpError(400, "Use a valid day (YYYY-MM-DD).");
    const rows = await prisma.task.findMany({
      where: dayListWhere(userId, day, today, zonedDayRange(day, timezone)),
      include: taskInclude,
      orderBy: [{ startTime: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      take: 500,
    });
    return rows.map(toTaskDTO);
  }

  const from = params.get("from");
  const to = params.get("to");
  if (from !== null || to !== null) {
    if (!isDateKey(from) || !isDateKey(to) || to < from) throw new HttpError(400, "Use a valid date range.");
    if (diffDays(from, to) > 62) throw new HttpError(400, "Ask for 62 days or fewer at a time.");
    const rows = await prisma.task.findMany({
      where: rangeWhere(userId, from, to),
      include: taskInclude,
      orderBy: [{ startTime: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      take: 2000,
    });
    return rows.map(toTaskDTO);
  }

  if (params.get("alerts") === "1") {
    const rows = await prisma.task.findMany({
      where: alertsWhere(userId, today),
      include: taskInclude,
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { startDate: { sort: "asc", nulls: "last" } }],
      take: 200,
    });
    return rows.map(toTaskDTO);
  }

  const viewParam = params.get("view") ?? "all";
  const sortParam = params.get("sort") ?? "date";
  const view = (TASK_VIEWS as string[]).includes(viewParam) ? (viewParam as TaskView) : "all";
  const sort = (TASK_SORTS as string[]).includes(sortParam) ? (sortParam as TaskSort) : "date";
  const limit = Math.min(Math.max(Number(params.get("limit")) || 100, 1), 1000);

  const rows = await prisma.task.findMany({
    where: listWhere(
      userId,
      {
        view,
        q: (params.get("q") ?? "").slice(0, 200),
        categoryId: params.get("categoryId"),
        priority: params.get("priority"),
        status: params.get("status"),
      },
      today,
      zonedDayRange(today, timezone),
    ),
    include: taskInclude,
    orderBy: listOrderBy(view, sort),
    take: limit + 1,
  });
  return { items: rows.slice(0, limit).map(toTaskDTO), hasMore: rows.length > limit };
});

export const POST = withUser(async (req, userId) => {
  const input = parseWith(taskCreateSchema, await readJson(req));
  const task = await createTaskForUser(userId, input);
  return Response.json(task, { status: 201 });
});
