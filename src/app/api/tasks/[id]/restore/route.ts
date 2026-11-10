import { prisma } from "@/lib/prisma";
import { HttpError, withUser, type IdContext } from "@/lib/api-server";
import { taskInclude, toTaskDTO } from "@/lib/serializers";

export const POST = withUser<IdContext>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const restored = await prisma.task.updateMany({ where: { id, userId }, data: { deletedAt: null } });
  if (restored.count === 0) throw new HttpError(404, "That task no longer exists.");
  const task = await prisma.task.findUniqueOrThrow({ where: { id }, include: taskInclude });
  return toTaskDTO(task);
});
