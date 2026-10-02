import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth, requireRole } from "@/lib/auth";
import { createOrganizationSchema } from "@/validators/organization.validator";

// CREATE Organization
export async function POST(req: NextRequest) {
  try {
    const { error, user } = requireRole(req, ["ADMIN", "OWNER"]);
    if (error) return error;

    const body = await req.json();
    const parsed = createOrganizationSchema.safeParse(body);

    if (!parsed.success) {
      //return errorResponse("Validation failed", 400, parsed.error.errors);
      return errorResponse("Validation failed", 400, parsed.error.issues);
    }

    const { name, slug, description } = parsed.data;

    // Check slug unique
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse("Slug already taken", 409);
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        ownerId: user!.userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(organization, "Organization created successfully", 201);
  } catch (error) {
    console.error("Create organization error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// LIST Organizations
export async function GET(req: NextRequest) {
  try {
    const { error, user } = requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const where: any = {
      deletedAt: null,
    };

    // OWNER শুধু নিজের Organization দেখতে পারবে
    if (user!.role === "OWNER") {
      where.ownerId = user!.userId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { projects: true, teams: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.organization.count({ where }),
    ]);

    return successResponse(
      {
        organizations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Organizations fetched successfully"
    );
  } catch (error) {
    console.error("List organizations error:", error);
    return errorResponse("Internal server error", 500);
  }
}