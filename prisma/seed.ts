import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { auth } from "../src/lib/auth";
import { getDomain } from "../src/lib/utils";

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

interface SeedPlace {
  name: string; // Display name
  slug: string; // URL-friendly slug
  moderatorEmail: string;
}

const seedPlaces: SeedPlace[] = [
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
  content?: string;
  url?: string;
  placeSlug: string;
  authorEmail: string;
}

const seedPosts: SeedPost[] = [
  // Programming
  {
    title: "What's your favorite programming language and why?",
    content:
      "I've been coding for about 5 years now and I keep coming back to Python for its simplicity and readability. What about you all? What's your go-to language and why do you love it?",
    placeSlug: "programming",
    authorEmail: "user1@example.com",
  },
  {
    title: "Tips for learning data structures and algorithms",
    content:
      "Just started preparing for technical interviews. Any recommendations for resources to learn DSA effectively? I've been using LeetCode but feeling a bit overwhelmed.",
    placeSlug: "programming",
    authorEmail: "user2@example.com",
  },
  // WebDev
  {
    title: "React vs Vue vs Svelte in 2024",
    content:
      "Starting a new project and trying to decide which frontend framework to use. I've used React before but heard great things about Svelte's performance. What are your experiences?",
    placeSlug: "webdev",
    authorEmail: "user1@example.com",
  },
  {
    title: "How do you handle state management in large apps?",
    content:
      "Our codebase is getting complex and useState/useContext aren't cutting it anymore. Should we go with Redux, Zustand, or something else? Looking for real-world experiences.",
    placeSlug: "webdev",
    authorEmail: "admin1@example.com",
  },
  // JavaScript
  {
    title: "Understanding async/await under the hood",
    content:
      "I use async/await all the time but never really understood how it works internally. Just learned about the event loop and promises. It's fascinating how JavaScript handles concurrency!",
    placeSlug: "javascript",
    authorEmail: "user3@example.com",
  },
  // TypeScript
  {
    title: "TypeScript 5.4 features I'm excited about",
    content:
      "The new NoInfer utility type is a game changer for library authors. Also loving the improvements to type narrowing. What features are you most excited about?",
    placeSlug: "typescript",
    authorEmail: "admin2@example.com",
  },
  {
    title: "Migrating a large codebase from JavaScript to TypeScript",
    content:
      "Just finished migrating our 100k LOC project to TypeScript. It took 3 months but the improved DX and caught bugs made it worth it. Happy to answer questions!",
    placeSlug: "typescript",
    authorEmail: "user1@example.com",
  },
  // React
  {
    title: "React Server Components are amazing",
    content:
      "Finally got around to trying RSC with Next.js 14 and wow. The performance improvements are real. Data fetching feels so much cleaner now.",
    placeSlug: "react",
    authorEmail: "user2@example.com",
  },
  // Node.js
  {
    title: "Bun vs Deno vs Node.js - which one are you using?",
    content:
      "With all these JavaScript runtimes available now, which one is your primary choice for backend development? I'm still on Node but curious about Bun's performance claims.",
    placeSlug: "nodejs",
    authorEmail: "admin1@example.com",
  },
  // Rust
  {
    title: "My journey learning Rust as a JavaScript developer",
    content:
      "Coming from JS, the borrow checker was tough at first. But after 2 months, I'm starting to appreciate how it prevents entire classes of bugs. The compiler errors are actually helpful!",
    placeSlug: "rust",
    authorEmail: "user3@example.com",
  },
  // Golang
  {
    title: "Go's simplicity is underrated",
    content:
      "After years of using complex frameworks, Go's standard library and straightforward approach is refreshing. Built a production API with just net/http. Love the fast compile times too!",
    placeSlug: "golang",
    authorEmail: "admin2@example.com",
  },
  // Python
  {
    title: "FastAPI has changed how I build APIs",
    content:
      "Switched from Flask to FastAPI and the automatic OpenAPI docs, type hints, and async support are amazing. Highly recommend for anyone building Python APIs.",
    placeSlug: "python",
    authorEmail: "user1@example.com",
  },
  // DevOps
  {
    title: "Docker Compose vs Kubernetes for small teams",
    content:
      "We're a team of 5 and wondering if we really need Kubernetes. Docker Compose has been working fine but feeling pressure to migrate. What's your experience?",
    placeSlug: "devops",
    authorEmail: "admin1@example.com",
  },
  // Linux
  {
    title: "Best distro for development in 2024?",
    content:
      "Setting up a new dev machine. Been using Ubuntu but considering Fedora or Arch. What distro do you use for development and why?",
    placeSlug: "linux",
    authorEmail: "user2@example.com",
  },
  // Gaming
  {
    title: "What games are you playing this weekend?",
    content:
      "Looking for recommendations! Just finished Baldur's Gate 3 and need something new. Into RPGs and strategy games mostly.",
    placeSlug: "gaming",
    authorEmail: "user3@example.com",
  },
  // Science
  {
    title: "James Webb Telescope latest discoveries",
    content:
      "The images and data coming from JWST continue to amaze me. The detail on distant galaxies is incredible. Science is awesome!",
    placeSlug: "science",
    authorEmail: "globaladmin@example.com",
  },
  // Technology
  {
    title: "AI developments are moving incredibly fast",
    content:
      "Every week there seems to be a new breakthrough in AI. From GPT-4 to open source models like Llama, it's hard to keep up. What developments are you most excited about?",
    placeSlug: "technology",
    authorEmail: "admin1@example.com",
  },
  // AskReddit style
  {
    title: "What's a skill you learned that unexpectedly changed your life?",
    content:
      "For me, it was learning to touch type. Seemed small at the time but it's made such a difference in my productivity and comfort while working.",
    placeSlug: "askreddit",
    authorEmail: "user1@example.com",
  },
  // Funny
  {
    title: "My rubber duck just solved a bug I spent 3 hours on",
    content:
      "Explained the problem to my rubber duck and immediately realized I had a typo in my variable name. The duck remains undefeated.",
    placeSlug: "funny",
    authorEmail: "user2@example.com",
  },
  // Link posts
  {
    title: "TIL Japan shut itself off from the world for over 200 years",
    url: "https://en.wikipedia.org/wiki/Sakoku",
    placeSlug: "science",
    authorEmail: "user1@example.com",
  },
  {
    title: "React 19 is now stable!",
    url: "https://react.dev/blog/2024/12/05/react-19",
    placeSlug: "react",
    authorEmail: "admin1@example.com",
  },
  {
    title: "The Rust Programming Language Book - Free Online",
    url: "https://doc.rust-lang.org/book/",
    placeSlug: "rust",
    authorEmail: "user2@example.com",
  },
  {
    title: "GitHub Copilot now free in VS Code",
    url: "https://github.blog/news-insights/product-news/github-copilot-in-vscode-free/",
    placeSlug: "technology",
    authorEmail: "globaladmin@example.com",
  },
  {
    title: "How DNS works - A comic explanation",
    url: "https://howdns.works/",
    placeSlug: "webdev",
    authorEmail: "user3@example.com",
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

  // Create places
  console.log("\n📦 Creating places...");
  const placeIdMap = new Map<string, string>();

  for (const seedPlace of seedPlaces) {
    const existingPlace = await prisma.place.findUnique({
      where: { slug: seedPlace.slug },
    });

    if (existingPlace) {
      console.log(
        `  ⏭️  Place ${seedPlace.name} (p/${seedPlace.slug}) already exists, skipping...`
      );
      placeIdMap.set(seedPlace.slug, existingPlace.id);
      continue;
    }

    const moderatorId = userIdMap.get(seedPlace.moderatorEmail);
    if (!moderatorId) {
      console.log(
        `  ❌ Failed to create place ${seedPlace.name}: moderator not found`
      );
      continue;
    }

    const place = await prisma.place.create({
      data: {
        name: seedPlace.name,
        slug: seedPlace.slug,
        moderatorId,
      },
    });

    placeIdMap.set(seedPlace.slug, place.id);
    console.log(`  ✅ Created place: ${seedPlace.name} (p/${seedPlace.slug})`);
  }

  // Create posts
  console.log("\n📝 Creating posts...");

  for (const seedPost of seedPosts) {
    const placeId = placeIdMap.get(seedPost.placeSlug);
    const authorId = userIdMap.get(seedPost.authorEmail);

    if (!placeId || !authorId) {
      console.log(
        `  ❌ Failed to create post "${seedPost.title}": place or author not found`
      );
      continue;
    }

    // Check if post already exists (by title in place)
    const existingPost = await prisma.post.findFirst({
      where: {
        title: seedPost.title,
        placeId,
      },
    });

    if (existingPost) {
      console.log(`  ⏭️  Post "${seedPost.title}" already exists, skipping...`);
      continue;
    }

    await prisma.post.create({
      data: {
        title: seedPost.title,
        content: seedPost.content || null,
        url: seedPost.url || null,
        domain: seedPost.url ? getDomain(seedPost.url) : `self.${seedPost.placeSlug}`,
        placeId,
        authorId,
      },
    });

    console.log(
      `  ✅ Created post: "${seedPost.title}" in p/${seedPost.placeSlug}`
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
