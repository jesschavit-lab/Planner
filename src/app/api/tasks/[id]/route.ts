import { prisma } from "@/lib/prisma";
import { HttpError, parseWith, readJson, userToday, withUser, type IdContext } from "@/lib/api-server";
import { taskInclude, toTaskDTO } from "@/lib/serializers";
import { updateTaskForUser } from "@/lib/task-service";
import { taskUpdateSchema } from "@/lib/validation";

export const GET = withUser<IdContext>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const task = await prisma.task.findFirst({ where: { id, userId }, include: taskInclude });
  if (!task) throw new HttpError(404, "That task no longer exists.");
  return toTaskDTO(task);
});

export const PATCH = withUser<IdContext>(async (req, userId, ctx) => {
  const { id } = await ctx.params;
  const input = parseWith(taskUpdateSchema, await readJson(req));
  const { today } = await userToday(userId);
  return updateTaskForUser(userId, id, input, today);
});

/** Moves a task to Trash; with ?permanent=1 deletes a task that is already in Trash. */
export const DELETE = withUser<IdContext>(async (req, userId, ctx) => {
  const { id } = await ctx.params;
  const permanent = new URL(req.url).searchParams.get("permanent") === "1";

  if (permanent) {
    const removed = await prisma.task.deleteMany({ where: { id, userId, deletedAt: { not: null } } });
    if (removed.count === 0) throw new HttpError(404, "Only tasks in Trash can be deleted permanently.");
    return { ok: true };
  }

  const trashed = await prisma.task.updateMany({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (trashed.count === 0) throw new HttpError(404, "That task no longer exists.");
  return { ok: true };
});
