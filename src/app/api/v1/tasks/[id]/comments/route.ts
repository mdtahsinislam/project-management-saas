

// //D:\BisMillaH-Help_me-Allah\Assignment-6-Backend\project-management-saas\src\app\api\v1\tasks\[id]\comments\route.ts

// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/response";
// import { requireAuth } from "@/lib/auth";
// import { z } from "zod";

// const commentSchema = z.object({
//   content: z.string().min(1, "Comment cannot be empty"),
// });

// // CREATE Comment
// export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error, user } = requireAuth(req);
//     if (error) return error;

//     const body = await req.json();
//     const parsed = commentSchema.safeParse(body);

//     if (!parsed.success) {
//       return errorResponse("Validation failed", 400, parsed.error.errors);
//     }

//     const task = await prisma.task.findFirst({
//       where: { id: params.id, deletedAt: null },
//     });

//     if (!task) {
//       return errorResponse("Task not found", 404);
//     }

//     const comment = await prisma.comment.create({
//       data: {
//         content: parsed.data.content,
//         taskId: params.id,
//         authorId: user!.userId,
//       },
//       include: {
//         author: { select: { id: true, name: true, avatar: true } },
//       },
//     });

//     await prisma.activityLog.create({
//       data: {
//         action: "COMMENT_ADDED",
//         details: { commentId: comment.id },
//         userId: user!.userId,
//         taskId: params.id,
//       },
//     });

//     return successResponse(comment, "Comment added successfully", 201);
//   } catch (error) {
//     console.error("Create comment error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }

// // LIST Comments of a Task
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { error } = requireAuth(req);
//     if (error) return error;

//     const comments = await prisma.comment.findMany({
//       where: { taskId: params.id, deletedAt: null },
//       include: {
//         author: { select: { id: true, name: true, avatar: true } },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return successResponse(comments, "Comments fetched successfully");
//   } catch (error) {
//     console.error("List comments error:", error);
//     return errorResponse("Internal server error", 500);
//   }
// }


//src/app/api/v1/tasks/[id]/comments/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

// CREATE Comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, user } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

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

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        taskId: id,
        authorId: user!.userId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "COMMENT_ADDED",
        details: { commentId: comment.id },
        userId: user!.userId,
        taskId: id,
      },
    });

    return successResponse(comment, "Comment added successfully", 201);
  } catch (error) {
    console.error("Create comment error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// LIST Comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = requireAuth(req);
    if (error) return error;

    const comments = await prisma.comment.findMany({
      where: { taskId: id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(comments, "Comments fetched successfully");
  } catch (error) {
    console.error("List comments error:", error);
    return errorResponse("Internal server error", 500);
  }
}