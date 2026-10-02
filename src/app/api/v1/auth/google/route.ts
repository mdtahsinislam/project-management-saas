import { NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return errorResponse("Google ID Token is required", 400);
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return errorResponse("Invalid Google token", 401);
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // New user → create with MEMBER role
      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          email,
          password: null, // Social login
          avatar: picture,
          role: "MEMBER",
          emailVerified: true,
        },
      });
    }

    if (!user.isActive) {
      return errorResponse("Your account is deactivated", 403);
    }

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
      "Google login successful"
    );
  } catch (error) {
    console.error("Google login error:", error);
    return errorResponse("Google authentication failed", 401);
  }
}