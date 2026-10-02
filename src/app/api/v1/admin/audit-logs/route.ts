import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = requireRole(req, ["ADMIN"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const action = searchParams.get("action");

    const where: any = {};
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { select: { id: true, title: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return successResponse(
      {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Audit logs fetched successfully"
    );
  } catch (error: any) {
    console.error("Audit logs error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}