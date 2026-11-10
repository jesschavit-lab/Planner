import { prisma } from "@/lib/prisma";
import { HttpError, parseWith, readJson, withUser, type IdContext } from "@/lib/api-server";
import { toGoalDTO } from "@/lib/serializers";
import { goalUpdateSchema } from "@/lib/validation";

export const PATCH = withUser<IdContext>(async (req, userId, ctx) => {
  const { id } = await ctx.params;
  const input = parseWith(goalUpdateSchema, await readJson(req));
  const existing = await prisma.goal.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new HttpError(404, "That goal no longer exists.");

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title: input.title,
      status: input.status,
      completedAt:
        input.status === undefined
          ? undefined
          : input.status === "COMPLETED"
            ? (existing.completedAt ?? new Date())
            : null,
    },
  });
  return toGoalDTO(goal);
});

export const DELETE = withUser<IdContext>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const removed = await prisma.goal.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (removed.count === 0) throw new HttpError(404, "That goal no longer exists.");
  return { ok: true };
});
