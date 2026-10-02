import { z } from "zod";

export const initiatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["STRIPE", "BKASH"]),
  organizationId: z.string().cuid().optional(),
  description: z.string().optional(),
});