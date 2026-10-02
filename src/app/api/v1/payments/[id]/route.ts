import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireAuth(req);
    if (error) return error;

    const payment = await prisma.payment.findFirst({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    // User can only see own payment (Admin can see all)
    if (user!.role !== "ADMIN" && payment.userId !== user!.userId) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(payment, "Payment fetched successfully");
  } catch (error: any) {
    console.error("Get payment error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}