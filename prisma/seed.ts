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

interface SeedCommunity {
  name: string; // Display name
  slug: string; // URL-friendly slug
  moderatorEmail: string;
}

const seedCommunities: SeedCommunity[] = [
  {
    name: "Programming",
    slug: "programming",
    moderatorEmail: "globaladmin@example.com",
  },
  {
    name: "Web Development",
    slug: "webdev",
    moderatorEmail: "admin1@example.com",
  },
  {
    name: "JavaScript",
    slug: "javascript",
    moderatorEmail: "admin1@example.com",
  },
  {
    name: "TypeScript",
    slug: "typescript",
    moderatorEmail: "admin2@example.com",
  },
  { name: "React", slug: "react", moderatorEmail: "user1@example.com" },
  { name: "Node.js", slug: "nodejs", moderatorEmail: "user1@example.com" },
  { name: "Rust", slug: "rust", moderatorEmail: "user2@example.com" },
  { name: "Go Lang", slug: "golang", moderatorEmail: "user2@example.com" },
  { name: "Python", slug: "python", moderatorEmail: "user3@example.com" },
  { name: "DevOps", slug: "devops", moderatorEmail: "admin2@example.com" },
  { name: "Linux", slug: "linux", moderatorEmail: "globaladmin@example.com" },
  { name: "Gaming", slug: "gaming", moderatorEmail: "user3@example.com" },
  { name: "Music", slug: "music", moderatorEmail: "user1@example.com" },
  { name: "Movies", slug: "movies", moderatorEmail: "user2@example.com" },
  { name: "Books", slug: "books", moderatorEmail: "user3@example.com" },
  { name: "Science", slug: "science", moderatorEmail: "admin1@example.com" },
  {
    name: "Technology",
    slug: "technology",
    moderatorEmail: "admin2@example.com",
  },
  { name: "News", slug: "news", moderatorEmail: "globaladmin@example.com" },
  {
    name: "Ask Reddit",
    slug: "askreddit",
    moderatorEmail: "globaladmin@example.com",
  },
  { name: "Funny", slug: "funny", moderatorEmail: "user1@example.com" },
];

interface SeedPost {
  title: string;
  content: string;
  communitySlug: string;
  authorEmail: string;
}

const seedPosts: SeedPost[] = [
  // Programming
  {
    title: "What's your favorite programming language and why?",
    content:
      "I've been coding for about 5 years now and I keep coming back to Python for its simplicity and readability. What about you all? What's your go-to language and why do you love it?",
    communitySlug: "programming",
    authorEmail: "user1@example.com",
  },
  {
    title: "Tips for learning data structures and algorithms",
    content:
      "Just started preparing for technical interviews. Any recommendations for resources to learn DSA effectively? I've been using LeetCode but feeling a bit overwhelmed.",
    communitySlug: "programming",
    authorEmail: "user2@example.com",
  },
  // WebDev
  {
    title: "React vs Vue vs Svelte in 2024",
    content:
      "Starting a new project and trying to decide which frontend framework to use. I've used React before but heard great things about Svelte's performance. What are your experiences?",
    communitySlug: "webdev",
    authorEmail: "user1@example.com",
  },
  {
    title: "How do you handle state management in large apps?",
    content:
      "Our codebase is getting complex and useState/useContext aren't cutting it anymore. Should we go with Redux, Zustand, or something else? Looking for real-world experiences.",
    communitySlug: "webdev",
    authorEmail: "admin1@example.com",
  },
  // JavaScript
  {
    title: "Understanding async/await under the hood",
    content:
      "I use async/await all the time but never really understood how it works internally. Just learned about the event loop and promises. It's fascinating how JavaScript handles concurrency!",
    communitySlug: "javascript",
    authorEmail: "user3@example.com",
  },
  // TypeScript
  {
    title: "TypeScript 5.4 features I'm excited about",
    content:
      "The new NoInfer utility type is a game changer for library authors. Also loving the improvements to type narrowing. What features are you most excited about?",
    communitySlug: "typescript",
    authorEmail: "admin2@example.com",
  },
  {
    title: "Migrating a large codebase from JavaScript to TypeScript",
    content:
      "Just finished migrating our 100k LOC project to TypeScript. It took 3 months but the improved DX and caught bugs made it worth it. Happy to answer questions!",
    communitySlug: "typescript",
    authorEmail: "user1@example.com",
  },
  // React
  {
    title: "React Server Components are amazing",
    content:
      "Finally got around to trying RSC with Next.js 14 and wow. The performance improvements are real. Data fetching feels so much cleaner now.",
    communitySlug: "react",
    authorEmail: "user2@example.com",
  },
  // Node.js
  {
    title: "Bun vs Deno vs Node.js - which one are you using?",
    content:
      "With all these JavaScript runtimes available now, which one is your primary choice for backend development? I'm still on Node but curious about Bun's performance claims.",
    communitySlug: "nodejs",
    authorEmail: "admin1@example.com",
  },
  // Rust
  {
    title: "My journey learning Rust as a JavaScript developer",
    content:
      "Coming from JS, the borrow checker was tough at first. But after 2 months, I'm starting to appreciate how it prevents entire classes of bugs. The compiler errors are actually helpful!",
    communitySlug: "rust",
    authorEmail: "user3@example.com",
  },
  // Golang
  {
    title: "Go's simplicity is underrated",
    content:
      "After years of using complex frameworks, Go's standard library and straightforward approach is refreshing. Built a production API with just net/http. Love the fast compile times too!",
    communitySlug: "golang",
    authorEmail: "admin2@example.com",
  },
  // Python
  {
    title: "FastAPI has changed how I build APIs",
    content:
      "Switched from Flask to FastAPI and the automatic OpenAPI docs, type hints, and async support are amazing. Highly recommend for anyone building Python APIs.",
    communitySlug: "python",
    authorEmail: "user1@example.com",
  },
  // DevOps
  {
    title: "Docker Compose vs Kubernetes for small teams",
    content:
      "We're a team of 5 and wondering if we really need Kubernetes. Docker Compose has been working fine but feeling pressure to migrate. What's your experience?",
    communitySlug: "devops",
    authorEmail: "admin1@example.com",
  },
  // Linux
  {
    title: "Best distro for development in 2024?",
    content:
      "Setting up a new dev machine. Been using Ubuntu but considering Fedora or Arch. What distro do you use for development and why?",
    communitySlug: "linux",
    authorEmail: "user2@example.com",
  },
  // Gaming
  {
    title: "What games are you playing this weekend?",
    content:
      "Looking for recommendations! Just finished Baldur's Gate 3 and need something new. Into RPGs and strategy games mostly.",
    communitySlug: "gaming",
    authorEmail: "user3@example.com",
  },
  // Science
  {
    title: "James Webb Telescope latest discoveries",
    content:
      "The images and data coming from JWST continue to amaze me. The detail on distant galaxies is incredible. Science is awesome!",
    communitySlug: "science",
    authorEmail: "globaladmin@example.com",
  },
  // Technology
  {
    title: "AI developments are moving incredibly fast",
    content:
      "Every week there seems to be a new breakthrough in AI. From GPT-4 to open source models like Llama, it's hard to keep up. What developments are you most excited about?",
    communitySlug: "technology",
    authorEmail: "admin1@example.com",
  },
  // AskReddit style
  {
    title: "What's a skill you learned that unexpectedly changed your life?",
    content:
      "For me, it was learning to touch type. Seemed small at the time but it's made such a difference in my productivity and comfort while working.",
    communitySlug: "askreddit",
    authorEmail: "user1@example.com",
  },
  // Funny
  {
    title: "My rubber duck just solved a bug I spent 3 hours on",
    content:
      "Explained the problem to my rubber duck and immediately realized I had a typo in my variable name. The duck remains undefeated. 🦆",
    communitySlug: "funny",
    authorEmail: "user2@example.com",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const userIdMap = new Map<string, string>();

  for (const seedUser of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: seedUser.email },
    });

    if (existingUser) {
      console.log(`  ⏭️  User ${seedUser.email} already exists, skipping...`);
      userIdMap.set(seedUser.email, existingUser.id);
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

    userIdMap.set(seedUser.email, result.user.id);
    console.log(`  ✅ Created ${seedUser.role}: ${seedUser.email}`);
  }

  // Create communities
  console.log("\n📦 Creating communities...");
  const communityIdMap = new Map<string, string>();

  for (const seedCommunity of seedCommunities) {
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: seedCommunity.slug },
    });

    if (existingCommunity) {
      console.log(
        `  ⏭️  Community ${seedCommunity.name} (c/${seedCommunity.slug}) already exists, skipping...`
      );
      communityIdMap.set(seedCommunity.slug, existingCommunity.id);
      continue;
    }

    const moderatorId = userIdMap.get(seedCommunity.moderatorEmail);
    if (!moderatorId) {
      console.log(
        `  ❌ Failed to create community ${seedCommunity.name}: moderator not found`
      );
      continue;
    }

    const community = await prisma.community.create({
      data: {
        name: seedCommunity.name,
        slug: seedCommunity.slug,
        moderatorId,
      },
    });

    communityIdMap.set(seedCommunity.slug, community.id);
    console.log(
      `  ✅ Created community: ${seedCommunity.name} (c/${seedCommunity.slug})`
    );
  }

  // Create posts
  console.log("\n📝 Creating posts...");

  for (const seedPost of seedPosts) {
    const communityId = communityIdMap.get(seedPost.communitySlug);
    const authorId = userIdMap.get(seedPost.authorEmail);

    if (!communityId || !authorId) {
      console.log(
        `  ❌ Failed to create post "${seedPost.title}": community or author not found`
      );
      continue;
    }

    // Check if post already exists (by title in community)
    const existingPost = await prisma.post.findFirst({
      where: {
        title: seedPost.title,
        communityId,
      },
    });

    if (existingPost) {
      console.log(`  ⏭️  Post "${seedPost.title}" already exists, skipping...`);
      continue;
    }

    await prisma.post.create({
      data: {
        title: seedPost.title,
        content: seedPost.content,
        communityId,
        authorId,
      },
    });

    console.log(
      `  ✅ Created post: "${seedPost.title}" in c/${seedPost.communitySlug}`
    );
  }

  console.log("\n✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
