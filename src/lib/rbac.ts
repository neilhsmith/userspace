import type { User } from "./auth";

export type Role = "user" | "admin" | "global_admin";

export function isGlobalAdmin(user: User | null | undefined): boolean {
  return user?.role === "global_admin";
}

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin" || isGlobalAdmin(user);
}

export function isUser(user: User | null | undefined): boolean {
  return user?.role === "user";
}

export function canEditPost(
  user: User | null | undefined,
  post: { authorId: string }
): boolean {
  if (!user) return false;
  // Global admins and admins can edit any post, users can only edit their own
  if (isGlobalAdmin(user) || user.role === "admin") return true;
  return post.authorId === user.id;
}

export function canDeletePost(
  user: User | null | undefined,
  post: { authorId: string }
): boolean {
  if (!user) return false;
  // Global admins and admins can delete any post, users can only delete their own
  if (isGlobalAdmin(user) || user.role === "admin") return true;
  return post.authorId === user.id;
}

export function canCreatePost(user: User | null | undefined): boolean {
  // Any authenticated user can create posts
  return !!user;
}
