import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeBkashPayment } from "@/lib/bkash";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get("paymentID");
    const status = searchParams.get("status");

    if (!paymentID) {
      return errorResponse("paymentID is required", 400);
    }

    const payment = await prisma.payment.findFirst({
      where: { bkashPaymentId: paymentID },
    });

    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    if (status === "success") {
      const executeRes = await executeBkashPayment(paymentID);

      if (executeRes.transactionStatus === "Completed") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            transactionId: executeRes.trxID,
          },
        });

        return successResponse(
          { paymentId: payment.id, status: "SUCCESS", trxID: executeRes.trxID },
          "Payment completed successfully"
        );
      }
    }

    // Failed or cancelled
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: status === "cancel" ? "CANCELLED" : "FAILED" },
    });

    return successResponse(
      { paymentId: payment.id, status: status || "FAILED" },
      "Payment not completed"
    );
  } catch (error: any) {
    console.error("bKash callback error:", error);
    return errorResponse(error?.message || "Callback failed", 500);
  }
}