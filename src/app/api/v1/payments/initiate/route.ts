import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";
import { initiatePaymentSchema } from "@/validators/payment.validator";
import { stripe } from "@/lib/stripe";
import { createBkashPayment } from "@/lib/bkash";

export async function POST(req: NextRequest) {
  try {
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = initiatePaymentSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);

      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { amount, method, organizationId, description } = parsed.data;

    // Create payment record (PENDING)
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: method === "BKASH" ? "BDT" : "USD",
        status: "PENDING",
        method,
        userId: user!.userId,
        organizationId: organizationId || null,
      },
    });

    if (method === "STRIPE") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: description || "Project Management SaaS Payment",
              },
              unit_amount: Math.round(amount * 100), // cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
        metadata: {
          paymentId: payment.id,
          userId: user!.userId,
        },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripeSessionId: session.id },
      });

      return successResponse(
        {
          paymentId: payment.id,
          method: "STRIPE",
          checkoutUrl: session.url,
          sessionId: session.id,
        },
        "Stripe payment session created",
        201
      );
    }

    // BKASH
    const invoice = `INV-${payment.id.slice(-8)}-${Date.now()}`;
    const callbackURL = `${process.env.NEXTAUTH_URL}/api/v1/payments/bkash/callback`;

    const bkashRes = await createBkashPayment(amount, invoice, callbackURL);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { bkashPaymentId: bkashRes.paymentID },
    });

    return successResponse(
      {
        paymentId: payment.id,
        method: "BKASH",
        bkashURL: bkashRes.bkashURL,
        paymentID: bkashRes.paymentID,
      },
      "bKash payment created",
      201
    );
  } catch (error: any) {
    console.error("Initiate payment error:", error);
    return errorResponse(error?.message || "Payment initiation failed", 500);
  }
}