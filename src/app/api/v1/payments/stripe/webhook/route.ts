import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return errorResponse(`Webhook Error: ${err.message}`, 400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "SUCCESS",
            transactionId: session.payment_intent,
          },
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: "CANCELLED" },
        });
      }
    }

    return successResponse({ received: true }, "Webhook processed");
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return errorResponse("Webhook failed", 500);
  }
}