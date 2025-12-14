import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getMyPosts } from "@/server/posts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["myPosts"],
    queryFn: () => getMyPosts(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || user?.email}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {user?.name || "Not set"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Role:</span>{" "}
                <span className="capitalize">{user?.role}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {(user?.role === "global_admin" || user?.role === "admin") && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Administrative controls</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {user?.role === "global_admin"
                  ? "As a global admin, you have full access to all system features."
                  : "As an admin, you can edit and delete any post in the system."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User's Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Posts</h2>
          <Button asChild>
            <Link to="/posts/new">New Post</Link>
          </Button>
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading your posts...</p>
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't created any posts yet
              </p>
              <Button asChild>
                <Link to="/posts/new">Create your first post</Link>
              </Button>
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
                      <CardDescription>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/posts/$postId" params={{ postId: post.id }}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/posts/$postId" params={{ postId: post.id }}>
                      View →
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
