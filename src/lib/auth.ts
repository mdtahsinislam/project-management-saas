import { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import { errorResponse } from "./response";
import { JwtPayload, Role } from "@/types";

export function getTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

export function getCurrentUser(req: NextRequest): JwtPayload | null {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return null;

    const decoded = verifyAccessToken(token) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) {
    return {
      error: errorResponse("Unauthorized - Please login first", 401),
      user: null,
    };
  }
  return { error: null, user };
}

export function requireRole(req: NextRequest, allowedRoles: Role[]) {
  const { error, user } = requireAuth(req);
  if (error) return { error, user: null };

  if (!allowedRoles.includes(user!.role)) {
    return {
      error: errorResponse("Forbidden - You do not have permission", 403),
      user: null,
    };
  }

  return { error: null, user };
}