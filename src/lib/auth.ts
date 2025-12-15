import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { prisma } from "./prisma"
import { subscribeUserToDefaultPlaces } from "./default-subscriptions"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // don't allow users to set their own role
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Subscribe new users to default places (non-blocking on failure)
          try {
            await subscribeUserToDefaultPlaces(user.id);
          } catch (error) {
            console.error("Failed to subscribe user to default places:", error);
          }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()], // must be last
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

