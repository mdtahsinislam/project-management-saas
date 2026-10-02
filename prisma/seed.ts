import { PrismaClient, Role, ProjectStatus, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ======================
  // 1. USERS
  // ======================

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const ownerPassword = await bcrypt.hash("Owner@123", 12);
  const memberPassword = await bcrypt.hash("Member@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@demo.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
      isActive: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {},
    create: {
      name: "Organization Owner",
      email: "owner@demo.com",
      password: ownerPassword,
      role: Role.OWNER,
      emailVerified: true,
      isActive: true,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: {
      name: "Team Member One",
      email: "member@demo.com",
      password: memberPassword,
      role: Role.MEMBER,
      emailVerified: true,
      isActive: true,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: "member2@demo.com" },
    update: {},
    create: {
      name: "Team Member Two",
      email: "member2@demo.com",
      password: memberPassword,
      role: Role.MEMBER,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log("✅ Users created");

  // ======================
  // 2. ORGANIZATION
  // ======================

  const organization = await prisma.organization.upsert({
    where: { slug: "tech-solutions" },
    update: {},
    create: {
      name: "Tech Solutions Ltd",
      slug: "tech-solutions",
      description: "A leading software development company",
      ownerId: owner.id,
    },
  });

  console.log("✅ Organization created");

  // ======================
  // 3. TEAM
  // ======================

  const team = await prisma.team.create({
    data: {
      name: "Development Team",
      description: "Main product development team",
      organizationId: organization.id,
      members: {
        create: [
          { userId: owner.id, role: Role.OWNER },
          { userId: member1.id, role: Role.MEMBER },
          { userId: member2.id, role: Role.MEMBER },
        ],
      },
    },
  });

  console.log("✅ Team created");

  // ======================
  // 4. PROJECT
  // ======================

  const project = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete redesign of company website",
      status: ProjectStatus.ACTIVE,
      organizationId: organization.id,
      teamId: team.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
    },
  });

  console.log("✅ Project created");

  // ======================
  // 5. SPRINT
  // ======================

  const sprint = await prisma.sprint.create({
    data: {
      name: "Sprint 1",
      goal: "Complete homepage and navigation",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      projectId: project.id,
    },
  });

  console.log("✅ Sprint created");

  // ======================
  // 6. TASKS
  // ======================

  const task1 = await prisma.task.create({
    data: {
      title: "Design Homepage",
      description: "Create modern homepage UI design",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: project.id,
      sprintId: sprint.id,
      creatorId: owner.id,
      assigneeId: member1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Implement Navbar",
      description: "Responsive navbar with mobile menu",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      projectId: project.id,
      sprintId: sprint.id,
      creatorId: owner.id,
      assigneeId: member2.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Setup Authentication",
      description: "JWT based auth system",
      status: TaskStatus.DONE,
      priority: TaskPriority.URGENT,
      projectId: project.id,
      creatorId: admin.id,
      assigneeId: member1.id,
    },
  });

  console.log("✅ Tasks created");

  // ======================
  // 7. COMMENTS
  // ======================

  await prisma.comment.create({
    data: {
      content: "Homepage design looks great! Please proceed.",
      taskId: task1.id,
      authorId: owner.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Working on mobile responsiveness now.",
      taskId: task1.id,
      authorId: member1.id,
    },
  });

  console.log("✅ Comments created");

  // ======================
  // 8. ACTIVITY LOGS
  // ======================

  await prisma.activityLog.createMany({
    data: [
      {
        action: "TASK_CREATED",
        details: { title: task1.title },
        userId: owner.id,
        taskId: task1.id,
      },
      {
        action: "TASK_ASSIGNED",
        details: { assigneeId: member1.id },
        userId: owner.id,
        taskId: task1.id,
      },
      {
        action: "TASK_STATUS_CHANGED",
        details: { from: "TODO", to: "IN_PROGRESS" },
        userId: member1.id,
        taskId: task1.id,
      },
    ],
  });

  console.log("✅ Activity logs created");

  // ======================
  // SUMMARY
  // ======================

  console.log("\n🎉 Seed completed successfully!\n");
  console.log("========== DEMO CREDENTIALS ==========");
  console.log("ADMIN  → email: admin@demo.com  | password: Admin@123");
  console.log("OWNER  → email: owner@demo.com  | password: Owner@123");
  console.log("MEMBER → email: member@demo.com | password: Member@123");
  console.log("MEMBER → email: member2@demo.com| password: Member@123");
  console.log("=====================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });