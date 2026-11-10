import { prisma } from "@/lib/prisma";
import { getSettingsRow, parseWith, readJson, withUser } from "@/lib/api-server";
import { toSettingsDTO } from "@/lib/serializers";
import { settingsUpdateSchema } from "@/lib/validation";

export const GET = withUser(async (_req, userId) => toSettingsDTO(await getSettingsRow(userId)));

export const PATCH = withUser(async (req, userId) => {
  const input = parseWith(settingsUpdateSchema, await readJson(req));
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
  return toSettingsDTO(settings);
});
