import { prisma } from "@/lib/prisma";
import { HttpError, parseWith, readJson, withUser } from "@/lib/api-server";
import { isMonthKey } from "@/lib/dates";
import { toGoalDTO } from "@/lib/serializers";
import { goalCreateSchema } from "@/lib/validation";

/** GET /api/goals?month=YYYY-MM — one month's goals; without month, the 200 most recent. */
export const GET = withUser(async (req, userId) => {
  const month = new URL(req.url).searchParams.get("month");
  if (month !== null && !isMonthKey(month)) throw new HttpError(400, "Use a valid month (YYYY-MM).");

  const rows = await prisma.goal.findMany({
    where: { userId, deletedAt: null, ...(month ? { month } : {}) },
    orderBy: month ? [{ createdAt: "asc" }] : [{ month: "desc" }, { createdAt: "asc" }],
    take: 200,
  });
  return rows.map(toGoalDTO);
});

export const POST = withUser(async (req, userId) => {
  const input = parseWith(goalCreateSchema, await readJson(req));
  const goal = await prisma.goal.create({ data: { userId, title: input.title, month: input.month } });
  return Response.json(toGoalDTO(goal), { status: 201 });
});
