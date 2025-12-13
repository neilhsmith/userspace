import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { getPosts } from "@/server/posts";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto text-center px-4 py-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Welcome to Userspace
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            A full-stack application with authentication, role-based access
            control, and a post system built with TanStack Start, Better Auth,
            and Prisma.
          </p>
          <div className="flex gap-4 justify-center">
            {isPending ? (
              <Button disabled>Loading...</Button>
            ) : session ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          {session && (
            <Button asChild>
              <Link to="/posts/new">New Post</Link>
            </Button>
          )}
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts?.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="hover:underline">
                        <Link to="/posts/$postId" params={{ postId: post.id }}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.author.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {post.author.name?.charAt(0) ||
                              post.author.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.author.name || post.author.email}</span>
                        <span>·</span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    {user &&
                      (canEditPost(user, post) ||
                        canDeletePost(user, post)) && (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to="/posts/$postId"
                            params={{ postId: post.id }}
                          >
                            Edit
                          </Link>
                        </Button>
                      )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/posts/$postId" params={{ postId: post.id }}>
                      Read more →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
