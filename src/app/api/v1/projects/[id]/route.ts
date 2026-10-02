// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth, requireRole } from "@/lib/auth";
// import { updateProjectSchema } from "@/validators/project.validator";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { error } = requireAuth(req);
//     if (error) return error;

//     const project = await prisma.project.findFirst({
//       where: { id, deletedAt: null },
//       include: {
//         organization: { select: { id: true, name: true } },
//         tasks: {
//           where: { deletedAt: null },
//           select: { id: true, title: true, status: true, priority: true },
//         },
//       },
//     });

//     if (!project) {
//       return errorResponse("Project not found", 404);
//     }

//     return successResponse(project, "Project fetched successfully");
//   } catch (error) {
//     console.error("Get project error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = updateProjectSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const existing = await prisma.project.findFirst({
//       where: { id, deletedAt: null },
//       include: { organization: true },
//     });

//     if (!existing) {
//       return errorResponse("Project not found", 404);
//     }

//     if (user!.role === "OWNER" && existing.organization.ownerId !== user!.userId) {
//       return errorResponse("Forbidden", 403);
//     }

//     const data: any = { ...parsed.data };
//     if (data.startDate) data.startDate = new Date(data.startDate);
//     if (data.endDate) data.endDate = new Date(data.endDate);

//     const updated = await prisma.project.update({
//       where: { id },
//       data,
//       include: {
//         organization: { select: { id: true, name: true } },
//       },
//     });

//     return successResponse(updated, "Project updated successfully");
//   } catch (error) {
//     console.error("Update project error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const existing = await prisma.project.findFirst({
//       where: { id, deletedAt: null },
//       include: { organization: true },
//     });

//     if (!existing) {
//       return errorResponse("Project not found", 404);
//     }

//     if (user!.role === "OWNER" && existing.organization.ownerId !== user!.userId) {
//       return errorResponse("Forbidden", 403);
//     }

//     await prisma.project.update({
//       where: { id },
//       data: { deletedAt: new Date() },
//     });

//     return successResponse(null, "Project deleted successfully");
//   } catch (error) {
//     console.error("Delete project error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

//src/app/api/v1/projects/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateProjectSchema } from "@/validators/project.validator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = requireAuth(req);
    if (error) return error;

    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        organization: { select: { id: true, name: true } },
        tasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true, priority: true },
        },
      },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    return successResponse(project, "Project fetched successfully");
  } catch (error) {
    console.error("Get project error:", error);
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
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { organization: true },
    });

    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    if (user!.role === "OWNER" && existing.organization.ownerId !== user!.userId) {
      return errorResponse("Forbidden", 403);
    }

    const data: any = { ...parsed.data };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    return successResponse(updated, "Project updated successfully");
  } catch (error) {
    console.error("Update project error:", error);
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

    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { organization: true },
    });

    if (!existing) {
      return errorResponse("Project not found", 404);
    }

    if (user!.role === "OWNER" && existing.organization.ownerId !== user!.userId) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return successResponse(null, "Project deleted successfully");
  } catch (error) {
    console.error("Delete project error:", error);
    return errorResponse("Internal server error", 500);
  }
}