import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  paymentId: z.string().cuid(),
  organizationId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { paymentId, organizationId } = parsed.data;

    // Transaction: Payment SUCCESS + Organization update একসাথে
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id: paymentId, userId: user!.userId },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== "SUCCESS") {
        throw new Error("Payment is not successful yet");
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { organizationId },
      });

      // এখানে চাইলে Organization-এ subscription status আপডেট করতে পারেন
      const organization = await tx.organization.findFirst({
        where: { id: organizationId, deletedAt: null },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      return { payment: updatedPayment, organization };
    });

    return successResponse(result, "Subscription confirmed successfully");
  } catch (error: any) {
    console.error("Confirm subscription error:", error);
    return errorResponse(error?.message || "Transaction failed", 500);
  }
}