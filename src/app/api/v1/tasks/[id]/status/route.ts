

// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\tasks\[id]\status\route.ts

// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth } from "@/lib/auth";
// import { updateTaskStatusSchema } from "@/validators/task.validator";

// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = updateTaskStatusSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const task = await prisma.task.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!task) {
//       return errorResponse("Task not found", 404);
//     }

//     const oldStatus = task.status;

//     const updated = await prisma.task.update({
//       where: { id: params.id },
//       data: { status: parsed.data.status },
//       include: {
//         assignee: { select: { id: true, name: true } },
//       },
//     });

//     // Activity Log
//     await prisma.activityLog.create({
//       data: {
//         action: "TASK_STATUS_CHANGED",
//         details: {
//           from: oldStatus,
//           to: parsed.data.status,
//         },
//         userId: user!.userId,
//         taskId: task.id,
//       },
//     });

//     return successResponse(updated, "Task status updated successfully");
//   } catch (error) {
//     console.error("Update task status error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }





//src/app/api/v1/tasks/[id]/status/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";
import { updateTaskStatusSchema } from "@/validators/task.validator";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = updateTaskStatusSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);

      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const task = await prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    const oldStatus = task.status;

    const updated = await prisma.task.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        assignee: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_STATUS_CHANGED",
        details: {
          from: oldStatus,
          to: parsed.data.status,
        },
        userId: user!.userId,
        taskId: id,
      },
    });

    return successResponse(updated, "Task status updated successfully");
  } catch (error) {
    console.error("Update task status error:", error);
    return errorResponse("Internal server error", 500);
  }
}