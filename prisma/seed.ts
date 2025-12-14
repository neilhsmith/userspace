import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { auth } from "../src/lib/auth";

const adapter = new PrismaLibSql({
  url: `file:${process.cwd()}/prisma/dev.db`,
});

const prisma = new PrismaClient({ adapter });

const PASSWORD = "$Password1!";

interface SeedUser {
  email: string;
  name: string;
  role: "global_admin" | "admin" | "user";
}

const seedUsers: SeedUser[] = [
  // 1 Global Admin
  {
    email: "globaladmin@example.com",
    name: "Global Admin",
    role: "global_admin",
  },
  // 2 Admins
  { email: "admin1@example.com", name: "Admin One", role: "admin" },
  { email: "admin2@example.com", name: "Admin Two", role: "admin" },
  // 3 Users
  { email: "user1@example.com", name: "User One", role: "user" },
  { email: "user2@example.com", name: "User Two", role: "user" },
  { email: "user3@example.com", name: "User Three", role: "user" },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const seedUser of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: seedUser.email },
    });

    if (existingUser) {
      console.log(`  ⏭️  User ${seedUser.email} already exists, skipping...`);
      continue;
    }

    // Use better-auth's API to create user (handles password hashing correctly)
    const result = await auth.api.signUpEmail({
      body: {
        email: seedUser.email,
        password: PASSWORD,
        name: seedUser.name,
      },
    });

    if (!result.user) {
      console.log(`  ❌ Failed to create user ${seedUser.email}`);
      continue;
    }

    // Update role (signUp defaults to "user")
    if (seedUser.role !== "user") {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role: seedUser.role },
      });
    }

    console.log(`  ✅ Created ${seedUser.role}: ${seedUser.email}`);
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


