
// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\projects\route.ts

// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth, requireRole } from "@/lib/auth";
// import { createProjectSchema } from "@/validators/project.validator";

// // CREATE Project
// export async function POST(req: NextRequest) {
//   try {
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = createProjectSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const { name, description, organizationId, teamId, startDate, endDate } = parsed.data;

//     // Check organization exists
//     const org = await prisma.organization.findFirst({
//       where: { id: organizationId, deletedAt: null },
//     });

//     if (!org) {
//       return errorResponse("Organization not found", 404);
//     }

//     // OWNER শুধু নিজের Organization-এ Project তৈরি করতে পারবে
//     if (user!.role === "OWNER" && org.ownerId !== user!.userId) {
//       return errorResponse("Forbidden", 403);
//     }

//     const project = await prisma.project.create({
//       data: {
//         name,
//         description,
//         organizationId,
//         teamId,
//         startDate: startDate ? new Date(startDate) : null,
//         endDate: endDate ? new Date(endDate) : null,
//       },
//       include: {
//         organization: { select: { id: true, name: true } },
//       },
//     });

//     return successResponse(project, "Project created successfully", 201);
//   } catch (error) {
//     console.error("Create project error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // LIST Projects (with filter, search, pagination)
// export async function GET(req: NextRequest) {
//   try {
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const status = searchParams.get("status");
//     const search = searchParams.get("search") || "";
//     const organizationId = searchParams.get("organizationId");

//     const where: any = { deletedAt: null };

//     if (status) where.status = status;
//     if (organizationId) where.organizationId = organizationId;
//     if (search) {
//       where.name = { contains: search, mode: "insensitive" };
//     }

//     // OWNER শুধু নিজের Organization-এর Project দেখবে
//     if (user!.role === "OWNER") {
//       where.organization = { ownerId: user!.userId };
//     }

//     const [projects, total] = await Promise.all([
//       prisma.project.findMany({
//         where,
//         include: {
//           organization: { select: { id: true, name: true } },
//           _count: { select: { tasks: true } },
//         },
//         skip: (page - 1) * limit,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.project.count({ where }),
//     ]);

//     return successResponse(
//       {
//         projects,
//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages: Math.ceil(total / limit),
//         },
//       },
//       "Projects fetched successfully"
//     );
//   } catch (error) {
//     console.error("List projects error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // src/app/api/v1/projects/route.ts

// import { getCache, setCache } from "@/lib/redis";   // ← উপরে import যোগ করুন

// // LIST Projects
// export async function GET(req: NextRequest) {
//   try {
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     // ... অন্যান্য searchParams

//     // ========== CACHE CHECK ==========
//     const cacheKey = `projects:user:${user!.userId}:page:${page}:limit:${limit}`;
//     const cached = await getCache(cacheKey);
//     if (cached) {
//       return successResponse(cached, "Projects fetched from cache");
//     }
//     // ========== CACHE CHECK END ==========

//     const where: any = { deletedAt: null };
//     // ... where conditions

//     const [projects, total] = await Promise.all([
//       prisma.project.findMany({ /* ... */ }),
//       prisma.project.count({ where }),
//     ]);

//     const responseData = {
//       projects,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };

//     // ========== SET CACHE ==========
//     await setCache(cacheKey, responseData, 60); // 60 seconds
//     // ========== SET CACHE END ==========

//     return successResponse(responseData, "Projects fetched successfully");
//   } catch (error) {
//     // ...
//   }
// }

// //correct full code file correctly 


import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth, requireRole } from "@/lib/auth";
import { createProjectSchema } from "@/validators/project.validator";
import { getCache, setCache } from "@/lib/redis";

// CREATE Project
export async function POST(req: NextRequest) {
  try {
    const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
    if (error) return error;

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { name, description, organizationId, teamId, startDate, endDate } = parsed.data;

    const org = await prisma.organization.findFirst({
      where: { id: organizationId, deletedAt: null },
    });

    if (!org) {
      return errorResponse("Organization not found", 404);
    }

    if (user!.role === "OWNER" && org.ownerId !== user!.userId) {
      return errorResponse("Forbidden", 403);
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        organizationId,
        teamId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    return successResponse(project, "Project created successfully", 201);
  } catch (error: any) {
    console.error("Create project error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}

// LIST Projects (with filter, search, pagination + Redis cache)
export async function GET(req: NextRequest) {
  try {
    const { error, user } = requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const organizationId = searchParams.get("organizationId");

    // ========== CACHE CHECK ==========
    const cacheKey = `projects:user:${user!.userId}:page:${page}:limit:${limit}:status:${status || ""}:search:${search}:org:${organizationId || ""}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return successResponse(cached, "Projects fetched from cache");
    }
    // ========== CACHE CHECK END ==========

    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // OWNER শুধু নিজের Organization-এর Project দেখবে
    if (user!.role === "OWNER") {
      where.organization = { ownerId: user!.userId };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true } },
          _count: { select: { tasks: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    const responseData = {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // ========== SET CACHE (60 seconds) ==========
    await setCache(cacheKey, responseData, 60);
    // ========== SET CACHE END ==========

    return successResponse(responseData, "Projects fetched successfully");
  } catch (error: any) {
    console.error("List projects error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}