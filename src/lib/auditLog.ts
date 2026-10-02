import { prisma } from "./prisma";

type AuditParams = {
  action: string;
  userId: string;
  taskId?: string;
  details?: any;
};

export async function createAuditLog({ action, userId, taskId, details }: AuditParams) {
  return prisma.activityLog.create({
    data: {
      action,
      userId,
      taskId: taskId || null,
      details: details || {},
    },
  });
}