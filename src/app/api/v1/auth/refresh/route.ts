import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse("Refresh token is required", 400);
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return errorResponse("Invalid or expired refresh token", 401);
    }

    // Check user still exists and active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return errorResponse("User not found or deactivated", 401);
    }

    // Generate new tokens
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      "Token refreshed successfully"
    );
  } catch (error) {
    console.error("Refresh error:", error);
    return errorResponse("Internal server error", 500);
  }
}