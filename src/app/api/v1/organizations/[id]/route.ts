

// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\organizations\[id]\route.ts

// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth, requireRole } from "@/lib/auth";
// import { updateOrganizationSchema } from "@/validators/organization.validator";

// // GET Single Organization
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error } = requireAuth(req);
//     if (error) return error;

//     const organization = await prisma.organization.findFirst({
//       where: { id: params.id, deletedAt: null },
//       include: {
//         owner: { select: { id: true, name: true, email: true } },
//         teams: true,
//         projects: {
//           where: { deletedAt: null },
//           select: { id: true, name: true, status: true },
//         },
//       },
//     });

//     if (!organization) {
//       return errorResponse("Organization not found", 404);
//     }

//     return successResponse(organization, "Organization fetched successfully");
//   } catch (error) {
//     console.error("Get organization error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // UPDATE Organization
// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = updateOrganizationSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const existing = await prisma.organization.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!existing) {
//       return errorResponse("Organization not found", 404);
//     }

//     // OWNER শুধু নিজের Organization আপডেট করতে পারবে
//     if (user!.role === "OWNER" && existing.ownerId !== user!.userId) {
//       return errorResponse("Forbidden - You can only update your own organization", 403);
//     }

//     const updated = await prisma.organization.update({
//       where: { id: params.id },
//       data: parsed.data,
//       include: {
//         owner: { select: { id: true, name: true, email: true } },
//       },
//     });

//     return successResponse(updated, "Organization updated successfully");
//   } catch (error) {
//     console.error("Update organization error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // SOFT DELETE Organization
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const existing = await prisma.organization.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!existing) {
//       return errorResponse("Organization not found", 404);
//     }

//     if (user!.role === "OWNER" && existing.ownerId !== user!.userId) {
//       return errorResponse("Forbidden", 403);
//     }

//     await prisma.organization.update({
//       where: { id: params.id },
//       data: { deletedAt: new Date() },
//     });

//     return successResponse(null, "Organization deleted successfully");
//   } catch (error) {
//     console.error("Delete organization error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

//src/app/api/v1/organizations/[id]/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateOrganizationSchema } from "@/validators/organization.validator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = requireAuth(req);
    if (error) return error;

    const organization = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        teams: true,
        projects: {
          where: { deletedAt: null },
          select: { id: true, name: true, status: true },
        },
      },
    });

    if (!organization) {
      return errorResponse("Organization not found", 404);
    }

    return successResponse(organization, "Organization fetched successfully");
  } catch (error) {
    console.error("Get organization error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
    if (error) return error;

    const body = await req.json();
    const parsed = updateOrganizationSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const existing = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse("Organization not found", 404);
    }

    if (user!.role === "OWNER" && existing.ownerId !== user!.userId) {
      return errorResponse("Forbidden - You can only update your own organization", 403);
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: parsed.data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(updated, "Organization updated successfully");
  } catch (error) {
    console.error("Update organization error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
    if (error) return error;

    const existing = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse("Organization not found", 404);
    }

    if (user!.role === "OWNER" && existing.ownerId !== user!.userId) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return successResponse(null, "Organization deleted successfully");
  } catch (error) {
    console.error("Delete organization error:", error);
    return errorResponse("Internal server error", 500);
  }
}