import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { error } = requireAuth(req);
    if (error) return error;

    // JWT-based system-এ সাধারণত client-side token ডিলিট করলেই হয়
    // চাইলে পরে Redis blacklist যোগ করা যায়

    return successResponse(null, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}