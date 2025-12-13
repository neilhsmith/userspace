import type { User } from "./auth"

export type Role = "user" | "admin"

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin"
}

export function isUser(user: User | null | undefined): boolean {
  return user?.role === "user"
}

export function canEditPost(
  user: User | null | undefined,
  post: { authorId: string }
): boolean {
  if (!user) return false
  // Admins can edit any post, users can only edit their own
  return isAdmin(user) || post.authorId === user.id
}

export function canDeletePost(
  user: User | null | undefined,
  post: { authorId: string }
): boolean {
  if (!user) return false
  // Admins can delete any post, users can only delete their own
  return isAdmin(user) || post.authorId === user.id
}

export function canCreatePost(user: User | null | undefined): boolean {
  // Any authenticated user can create posts
  return !!user
}

