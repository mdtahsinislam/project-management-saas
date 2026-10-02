

// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\tasks\[id]\assign\route.ts

// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth } from "@/lib/auth";
// import { z } from "zod";

// const assignSchema = z.object({
//   assigneeId: z.string().cuid().nullable(),
// });

// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = assignSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const task = await prisma.task.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!task) {
//       return errorResponse("Task not found", 404);
//     }

//     // যদি assigneeId দেওয়া থাকে তাহলে ইউজার আছে কিনা চেক
//     if (parsed.data.assigneeId) {
//       const assignee = await prisma.user.findUnique({
//         where: { id: parsed.data.assigneeId },
//       });
//       if (!assignee) {
//         return errorResponse("Assignee not found", 404);
//       }
//     }

//     const updated = await prisma.task.update({
//       where: { id: params.id },
//       data: { assigneeId: parsed.data.assigneeId },
//       include: {
//         assignee: { select: { id: true, name: true, email: true } },
//       },
//     });

//     await prisma.activityLog.create({
//       data: {
//         action: "TASK_ASSIGNED",
//         details: {
//           assigneeId: parsed.data.assigneeId,
//         },
//         userId: user!.userId,
//         taskId: params.id,
//       },
//     });

//     return successResponse(updated, "Task assigned successfully");
//   } catch (error) {
//     console.error("Assign task error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }




//src/app/api/v1/tasks/[id]/assign/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const assignSchema = z.object({
  assigneeId: z.string().cuid().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = assignSchema.safeParse(body);

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

    if (parsed.data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: parsed.data.assigneeId },
      });
      if (!assignee) {
        return errorResponse("Assignee not found", 404);
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { assigneeId: parsed.data.assigneeId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_ASSIGNED",
        details: {
          assigneeId: parsed.data.assigneeId,
        },
        userId: user!.userId,
        taskId: id,
      },
    });

    return successResponse(updated, "Task assigned successfully");
  } catch (error) {
    console.error("Assign task error:", error);
    return errorResponse("Internal server error", 500);
  }
}