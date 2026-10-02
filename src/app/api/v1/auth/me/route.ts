import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error, user } = requireAuth(req);
    if (error) return error;

    const dbUser = await prisma.user.findUnique({
      where: { id: user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return errorResponse("User not found", 404);
    }

    return successResponse(dbUser, "User fetched successfully");
  } catch (error) {
    console.error("Me error:", error);
    return errorResponse("Internal server error", 500);
  }
}