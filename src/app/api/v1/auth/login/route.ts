


// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\auth\login\route.ts

// import { NextRequest } from "next/server";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { loginSchema } from "@/validators/auth.validator";
// import { signAccessToken, signRefreshToken } from "@/lib/jwt";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const parsed = loginSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const { email, password } = parsed.data;

//     // Find user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user || !user.password) {
//       return errorResponse("Invalid email or password", 401);
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return errorResponse("Invalid email or password", 401);
//     }

//     // Check if active
//     if (!user.isActive) {
//       return errorResponse("Your account is deactivated", 403);
//     }

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
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         },
//         accessToken,
//         refreshToken,
//       },
//       "Login successful"
//     );
//   } catch (error) {
//     console.error("Login error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }


// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\auth\login\route.ts
// import { rateLimit } from "@/lib/rateLimit";   // ← উপরে import

// export async function POST(req: NextRequest) {
//   try {
//     // ========== RATE LIMIT ==========
//     const ip = req.headers.get("x-forwarded-for") || "unknown";
//     const { success } = rateLimit(ip, 30, 60 * 1000); // 30 requests per minute

//     if (!success) {
//       return errorResponse("Too many requests. Please try again later.", 429);
//     }
//     // ========== RATE LIMIT END ==========

//     const body = await req.json();
//     // ... বাকি login কোড আগের মতো
//   } catch (error) {
//     // ...
//   }
// }


// //written full code correctly 




import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { loginSchema } from "@/validators/auth.validator";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // ========== RATE LIMIT ==========
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(ip, 30, 60 * 1000); // 30 requests per minute

    if (!success) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }
    // ========== RATE LIMIT END ==========

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check if active
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
        },
        accessToken,
        refreshToken,
      },
      "Login successful"
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}