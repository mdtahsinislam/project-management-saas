import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = requireRole(req, ["ADMIN"]);
    if (error) return error;

    const [
      totalUsers,
      totalOrganizations,
      totalProjects,
      totalTasks,
      tasksByStatus,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count({ where: { deletedAt: null } }),
      prisma.task.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    return successResponse(
      {
        stats: {
          totalUsers,
          totalOrganizations,
          totalProjects,
          totalTasks,
          tasksByStatus,
        },
        recentActivities,
      },
      "Dashboard data fetched successfully"
    );
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return errorResponse("Internal server error", 500);
  }
}