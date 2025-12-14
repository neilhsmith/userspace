import { Link, MatchRoute } from "@tanstack/react-router";
import type { Session } from "@/lib/auth-client";
import { canDeletePost, canEditPost } from "@/lib/rbac";
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

export type PostPreviewPost = {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  domain: string;
  createdAt: string | Date;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  place: {
    id: string;
    name: string;
    slug: string;
  };
};

type PostPreviewProps = {
  post: PostPreviewPost;
  currentUser?: Session["user"] | null;
  showPlaceChip?: boolean;
  showDomainLink?: boolean;
  pendingReadMore?: boolean;
};

export function PostPreview({
  post,
  currentUser,
  showPlaceChip = true,
  showDomainLink = true,
  pendingReadMore = false,
}: PostPreviewProps) {
  const showEdit =
    !!currentUser &&
    (canEditPost(currentUser, post) || canDeletePost(currentUser, post));

  return (
    <Card>
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
                  {showDomainLink && (
                    <Link
                      to="/domain/$domain"
                      params={{ domain: post.domain }}
                      className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                    >
                      ({post.domain})
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/posts/$postId" params={{ postId: post.id }}>
                    {post.title}
                  </Link>
                  {showDomainLink && (
                    <Link
                      to="/p/$slug"
                      params={{ slug: post.place.slug }}
                      className="text-sm font-normal text-muted-foreground ml-2 hover:underline"
                    >
                      ({post.domain})
                    </Link>
                  )}
                </>
              )}
            </CardTitle>

            <CardDescription className="flex items-center gap-2 flex-wrap">
              {showPlaceChip && (
                <>
                  <Link
                    to="/p/$slug"
                    params={{ slug: post.place.slug }}
                    className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {post.place.name}
                  </Link>
                  <span>·</span>
                </>
              )}

              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.image || undefined} />
                <AvatarFallback className="text-xs">
                  {post.author.name?.charAt(0) || post.author.email?.charAt(0)}
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

          {showEdit && (
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
          <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        </CardContent>
      )}

      <CardFooter>
        <Button asChild variant="ghost" size="sm">
          <Link to="/posts/$postId" params={{ postId: post.id }}>
            {pendingReadMore ? (
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
            ) : (
              "Read more →"
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
