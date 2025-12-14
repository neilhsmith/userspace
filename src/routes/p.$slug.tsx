import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPlaceBySlug, getPlacePosts } from "@/server/places";
import { useSession } from "@/lib/auth-client";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { safeHref } from "@/lib/utils";
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
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/p/$slug")({
  component: PlacePage,
});

function PlacePage() {
  const { slug } = Route.useParams();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: place, isLoading: placeLoading } = useQuery({
    queryKey: ["place", slug],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => (getPlaceBySlug as any)({ data: { slug } }),
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["placePosts", slug],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => (getPlacePosts as any)({ data: { slug } }),
    enabled: !!place,
  });

  if (placeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading place...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">Place not found</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Place Header */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <p className="text-sm text-muted-foreground">p/{place.slug}</p>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <span>Moderated by</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={place.moderator.image || undefined} />
                <AvatarFallback className="text-xs">
                  {place.moderator.name?.charAt(0) ||
                    place.moderator.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{place.moderator.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {place._count.posts} {place._count.posts === 1 ? "post" : "posts"}
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link to="/posts/new" search={{ place: place.slug }}>
                New Post
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts in this place yet</p>
            {user && (
              <Button asChild className="mt-4">
                <Link to="/posts/new" search={{ place: place.slug }}>
                  Create the first post
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts?.map(
            (post: {
              id: string;
              title: string;
              content: string | null;
              url: string | null;
              domain: string;
              createdAt: string;
              author: {
                id: string;
                name: string | null;
                email: string;
                image: string | null;
              };
              authorId: string;
            }) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="hover:underline">
                        {post.url ? (
                          <>
                            <a
                              href={safeHref(post.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {post.title}
                            </a>
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
                            <Link
                              to="/posts/$postId"
                              params={{ postId: post.id }}
                            >
                              {post.title}
                            </Link>
                            <Link
                              to="/p/$slug"
                              params={{ slug }}
                              className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                            >
                              ({post.domain})
                            </Link>
                          </>
                        )}
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
                      Read more →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
