import { prisma } from "@/lib/prisma";
import { HttpError, parseWith, readJson, withUser } from "@/lib/api-server";
import { isDateKey } from "@/lib/dates";
import { emptyJournal, toJournalDTO } from "@/lib/serializers";
import { journalUpdateSchema } from "@/lib/validation";

type DateContext = { params: Promise<{ date: string }> };

async function dateParam(ctx: DateContext): Promise<string> {
  const { date } = await ctx.params;
  if (!isDateKey(date)) throw new HttpError(400, "Use a valid date (YYYY-MM-DD).");
  return date;
}

export const GET = withUser<DateContext>(async (_req, userId, ctx) => {
  const date = await dateParam(ctx);
  const entry = await prisma.journalEntry.findUnique({ where: { userId_date: { userId, date } } });
  return entry ? toJournalDTO(entry) : emptyJournal(date);
});

/** PUT /api/journal/:date — saves only the fields that are sent. */
export const PUT = withUser<DateContext>(async (req, userId, ctx) => {
  const date = await dateParam(ctx);
  // Fields left out of the body are undefined, which Prisma leaves untouched.
  const input = parseWith(journalUpdateSchema, await readJson(req));
  const entry = await prisma.journalEntry.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, ...input },
    update: input,
  });
  return toJournalDTO(entry);
});
