

// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\auth\register\route.ts

// import { NextRequest } from "next/server";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { registerSchema } from "@/validators/auth.validator";
// import { signAccessToken, signRefreshToken } from "@/lib/jwt";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const parsed = registerSchema.safeParse(body);

//     if (!parsed.success) {
//       //return errorResponse("Validation failed", 400, parsed.error.errors);
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const { name, email, password, role } = parsed.data;

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return errorResponse("Email already registered", 409);
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create user
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: role || "MEMBER",
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//       },
//     });

//     // Generate tokens
//     const accessToken = signAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//     });

//     const refreshToken = signRefreshToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//     });

//     return successResponse(
//       {
//         user,
//         accessToken,
//         refreshToken,
//       },
//       "Registration successful",
//       201
//     );
//   } catch (error) {
//     console.error("Register error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

//D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\auth\register\route.ts

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { registerSchema } from "@/validators/auth.validator";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

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
        user,
        accessToken,
        refreshToken,
      },
      "Registration successful",
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}