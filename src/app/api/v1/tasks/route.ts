// // import { NextRequest } from "next/server";
// // import { prisma } from "@/lib/prisma";
// // import { successResponse, errorResponse } from "@/lib/response";
// // import { requireAuth } from "@/lib/auth";
// // import { createTaskSchema } from "@/validators/task.validator";

// // // CREATE Task
// // export async function POST(req: NextRequest) {
// //   try {
// //     const { error, user } = requireAuth(req);
// //     if (error) return error;

// //     const body = await req.json();
// //     const parsed = createTaskSchema.safeParse(body);

// //     if (!parsed.success) {
// //       return errorResponse("Validation failed", 400, parsed.error.errors);
// //     }

// //     const data = parsed.data;

// //     // Check project exists
// //     const project = await prisma.project.findFirst({
// //       where: { id: data.projectId, deletedAt: null },
// //     });

// //     if (!project) {
// //       return errorResponse("Project not found", 404);
// //     }

// //     const task = await prisma.task.create({
// //       data: {
// //         title: data.title,
// //         description: data.description,
// //         projectId: data.projectId,
// //         sprintId: data.sprintId,
// //         assigneeId: data.assigneeId,
// //         priority: data.priority,
// //         dueDate: data.dueDate ? new Date(data.dueDate) : null,
// //         creatorId: user!.userId,
// //       },
// //       include: {
// //         creator: { select: { id: true, name: true } },
// //         assignee: { select: { id: true, name: true } },
// //         project: { select: { id: true, name: true } },
// //       },
// //     });

// //     // Activity Log
// //     await prisma.activityLog.create({
// //       data: {
// //         action: "TASK_CREATED",
// //         details: { taskId: task.id, title: task.title },
// //         userId: user!.userId,
// //         taskId: task.id,
// //       },
// //     });

// //     return successResponse(task, "Task created successfully", 201);
// //   } catch (error) {
// //     console.error("Create task error:", error);
// //     return errorResponse("Internal server error", 500);
// //   }
// // }

// // // LIST Tasks
// // export async function GET(req: NextRequest) {
// //   try {
// //     const { error, user } = requireAuth(req);
// //     if (error) return error;

// //     const { searchParams } = new URL(req.url);
// //     const page = parseInt(searchParams.get("page") || "1");
// //     const limit = parseInt(searchParams.get("limit") || "10");
// //     const status = searchParams.get("status");
// //     const priority = searchParams.get("priority");
// //     const projectId = searchParams.get("projectId");
// //     const search = searchParams.get("search") || "";

// //     const where: any = { deletedAt: null };

// //     if (status) where.status = status;
// //     if (priority) where.priority = priority;
// //     if (projectId) where.projectId = projectId;
// //     if (search) {
// //       where.title = { contains: search, mode: "insensitive" };
// //     }

// //     const [tasks, total] = await Promise.all([
// //       prisma.task.findMany({
// //         where,
// //         include: {
// //           creator: { select: { id: true, name: true } },
// //           assignee: { select: { id: true, name: true } },
// //           project: { select: { id: true, name: true } },
// //         },
// //         skip: (page - 1) * limit,
// //         take: limit,
// //         orderBy: { createdAt: "desc" },
// //       }),
// //       prisma.task.count({ where }),
// //     ]);

// //     return successResponse(
// //       {
// //         tasks,
// //         pagination: {
// //           page,
// //           limit,
// //           total,
// //           totalPages: Math.ceil(total / limit),
// //         },
// //       },
// //       "Tasks fetched successfully"
// //     );
// //   } catch (error) {
// //     console.error("List tasks error:", error);
// //     return errorResponse("Internal server error", 500);
// //   }
// // }



// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth, requireRole } from "@/lib/auth";
// import { updateTaskSchema } from "@/validators/task.validator";

// // GET Single Task
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { error } = requireAuth(req);
//     if (error) return error;

//     const task = await prisma.task.findFirst({
//       where: { id, deletedAt: null },
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

// // UPDATE Task
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = updateTaskSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const existing = await prisma.task.findFirst({
//       where: { id, deletedAt: null },
//     });

//     if (!existing) {
//       return errorResponse("Task not found", 404);
//     }

//     const data: any = { ...parsed.data };
//     if (data.dueDate) data.dueDate = new Date(data.dueDate);

//     const updated = await prisma.task.update({
//       where: { id },
//       data,
//       include: {
//         creator: { select: { id: true, name: true } },
//         assignee: { select: { id: true, name: true } },
//         project: { select: { id: true, name: true } },
//       },
//     });

//     await prisma.activityLog.create({
//       data: {
//         action: "TASK_UPDATED",
//         details: parsed.data,
//         userId: user!.userId,
//         taskId: id,
//       },
//     });

//     return successResponse(updated, "Task updated successfully");
//   } catch (error) {
//     console.error("Update task error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // SOFT DELETE Task
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
//     if (error) return error;

//     const existing = await prisma.task.findFirst({
//       where: { id, deletedAt: null },
//     });

//     if (!existing) {
//       return errorResponse("Task not found", 404);
//     }

//     await prisma.task.update({
//       where: { id },
//       data: { deletedAt: new Date() },
//     });

//     await prisma.activityLog.create({
//       data: {
//         action: "TASK_DELETED",
//         details: { taskId: id },
//         userId: user!.userId,
//         taskId: id,
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
import { requireAuth } from "@/lib/auth";
import { createTaskSchema } from "@/validators/task.validator";

// CREATE Task
export async function POST(req: NextRequest) {
  try {
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const data = parsed.data;

    const project = await prisma.project.findFirst({
      where: { id: data.projectId, deletedAt: null },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        sprintId: data.sprintId,
        assigneeId: data.assigneeId,
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        creatorId: user!.userId,
      },
      include: {
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_CREATED",
        details: { taskId: task.id, title: task.title },
        userId: user!.userId,
        taskId: task.id,
      },
    });

    return successResponse(task, "Task created successfully", 201);
  } catch (error) {
    console.error("Create task error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// LIST Tasks
export async function GET(req: NextRequest) {
  try {
    const { error } = requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search") || "";

    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    return successResponse(
      {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Tasks fetched successfully"
    );
  } catch (error) {
    console.error("List tasks error:", error);
    return errorResponse("Internal server error", 500);
  }
}