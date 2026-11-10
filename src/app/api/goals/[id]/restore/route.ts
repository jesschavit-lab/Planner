import { prisma } from "@/lib/prisma";
import { HttpError, withUser, type IdContext } from "@/lib/api-server";
import { toGoalDTO } from "@/lib/serializers";

export const POST = withUser<IdContext>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const restored = await prisma.goal.updateMany({ where: { id, userId }, data: { deletedAt: null } });
  if (restored.count === 0) throw new HttpError(404, "That goal no longer exists.");
  return toGoalDTO(await prisma.goal.findUniqueOrThrow({ where: { id } }));
});
