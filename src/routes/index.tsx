import { createFileRoute, Link, MatchRoute } from "@tanstack/react-router";
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
  const { data: session } = useSession();
  const user = session?.user;

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recent Posts</h1>
          <p className="text-muted-foreground">
            Browse the latest posts from the places
          </p>
        </div>
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
                    <CardTitle>
                      {post.url ? (
                        <>
                          <a href={post.url}>{post.title}</a>
                          <Link
                            to="/domain/$domain"
                            params={{ domain: post.domain }}
                            className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                          >
                            ({post.domain})
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/posts/$postId" params={{ postId: post.id }}>
                            {post.title}
                          </Link>
                          <Link
                            to="/p/$slug"
                            params={{ slug: post.place.slug }}
                            className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                          >
                            ({post.domain})
                          </Link>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <Link
                        to="/p/$slug"
                        params={{ slug: post.place.slug }}
                        className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {post.place.name}
                      </Link>
                      <span>·</span>
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
                    (canEditPost(user, post) || canDeletePost(user, post)) && (
                      <Button asChild variant="outline" size="sm">
                        <Link to="/posts/$postId" params={{ postId: post.id }}>
                          Edit
                        </Link>
                      </Button>
                    )}
                </div>
              </CardHeader>
              {post.content && (
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
              )}
              <CardFooter>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/posts/$postId" params={{ postId: post.id }}>
                    <MatchRoute
                      to="/posts/$postId"
                      params={{ postId: post.id }}
                      pending
                    >
                      {(match) => (
                        <span className={match ? "animate-pulse" : ""}>
                          Read more →
                        </span>
                      )}
                    </MatchRoute>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
