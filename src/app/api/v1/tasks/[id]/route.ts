
// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\tasks\[id]\route.ts


// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth, requireRole } from "@/lib/auth";
// import { updateTaskSchema } from "@/validators/task.validator";

// // GET Single Task
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error } = requireAuth(req);
//     if (error) return error;

//     const task = await prisma.task.findFirst({
//       where: { id: params.id, deletedAt: null },
//       include: {
//         creator: { select: { id: true, name: true, email: true } },
//         assignee: { select: { id: true, name: true, email: true } },
//         project: { select: { id: true, name: true } },
//         comments: {
//           where: { deletedAt: null },
//           include: { author: { select: { id: true, name: true } } },
//           orderBy: { createdAt: "desc" },
//         },
//         subTasks: { where: { deletedAt: null } },
//         activityLogs: {
//           include: { user: { select: { id: true, name: true } } },
//           orderBy: { createdAt: "desc" },
//           take: 20,
//         },
//       },
//     });

//     if (!task) {
//       return errorResponse("Task not found", 404);
//     }

//     return successResponse(task, "Task fetched successfully");
//   } catch (error) {
//     console.error("Get task error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // UPDATE Task (title, description, priority, assignee, dueDate)
// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = updateTaskSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const existing = await prisma.task.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!existing) {
//       return errorResponse("Task not found", 404);
//     }

//     const data: any = { ...parsed.data };
//     if (data.dueDate) data.dueDate = new Date(data.dueDate);

//     const updated = await prisma.task.update({
//       where: { id: params.id },
//       data,
//       include: {
//         creator: { select: { id: true, name: true } },
//         assignee: { select: { id: true, name: true } },
//         project: { select: { id: true, name: true } },
//       },
//     });

//     // Activity Log
//     await prisma.activityLog.create({
//       data: {
//         action: "TASK_UPDATED",
//         details: parsed.data,
//         userId: user!.userId,
//         taskId: params.id,
//       },
//     });

//     return successResponse(updated, "Task updated successfully");
//   } catch (error) {
//     console.error("Update task error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // SOFT DELETE Task
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const existing = await prisma.task.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!existing) {
//       return errorResponse("Task not found", 404);
//     }

//     await prisma.task.update({
//       where: { id: params.id },
//       data: { deletedAt: new Date() },
//     });

//     await prisma.activityLog.create({
//       data: {
//         action: "TASK_DELETED",
//         details: { taskId: params.id },
//         userId: user!.userId,
//         taskId: params.id,
//       },
//     });

//     return successResponse(null, "Task deleted successfully");
//   } catch (error) {
//     console.error("Delete task error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }





import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth, requireRole } from "@/lib/auth";
import { updateTaskSchema } from "@/validators/task.validator";

// GET Single Task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = requireAuth(req);
    if (error) return error;

    const task = await prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        comments: {
          where: { deletedAt: null },
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        subTasks: { where: { deletedAt: null } },
        activityLogs: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    return successResponse(task, "Task fetched successfully");
  } catch (error: any) {
    console.error("Get task error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}

// UPDATE Task
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const existing = await prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse("Task not found", 404);
    }

    const data: any = { ...parsed.data };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_UPDATED",
        details: parsed.data,
        userId: user!.userId,
        taskId: id,
      },
    });

    return successResponse(updated, "Task updated successfully");
  } catch (error: any) {
    console.error("Update task error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}

// SOFT DELETE Task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
    if (error) return error;

    const existing = await prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse("Task not found", 404);
    }

    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_DELETED",
        details: { taskId: id },
        userId: user!.userId,
        taskId: id,
      },
    });

    return successResponse(null, "Task deleted successfully");
  } catch (error: any) {
    console.error("Delete task error:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}