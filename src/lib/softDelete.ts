import { prisma } from "./prisma";

export async function softDelete(model: any, id: string) {
  return model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restoreSoftDelete(model: any, id: string) {
  return model.update({
    where: { id },
    data: { deletedAt: null },
  });
}

// সব query-তে deletedAt: null যোগ করার helper
export const notDeleted = { deletedAt: null };