import { Link } from "@tanstack/react-router";
import type { Session } from "@/lib/auth-client";
import { canDeletePost, canEditPost } from "@/lib/rbac";
import type { Post } from "@/lib/post";
import { safeHref } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { VoteButtons } from "@/components/vote-buttons";

type PostPreviewProps = {
  post: Post;
  index?: number;
  currentUser?: Session["user"] | null;
  showPlace?: boolean;
  showDomainLink?: boolean;
};

export function PostPreview({
  post,
  index,
  currentUser,
  showPlace = true,
  showDomainLink = true,
}: PostPreviewProps) {
  const showEdit =
    !!currentUser &&
    (canEditPost(currentUser, post) || canDeletePost(currentUser, post));

  return (
    <div className="flex gap-3 py-2 text-sm">
      {index !== undefined && (
        <span className="text-muted-foreground/60 w-6 text-right shrink-0 self-center text-sm font-normal leading-none tabular-nums">
          {index}
        </span>
      )}

      <div className="flex self-center">
        <VoteButtons
          post={post}
          isAuthenticated={!!currentUser}
          orientation="vertical"
          size="md"
        />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="leading-tight text-lg">
          {post.url ? (
            <a
              href={safeHref(post.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              {post.title}
            </a>
          ) : (
            <Link
              to="/posts/$postId"
              params={{ postId: post.id }}
              className="text-foreground hover:underline font-medium"
            >
              {post.title}
            </Link>
          )}
          {showDomainLink && (
            <Link
              to={post.url ? "/domain/$domain" : "/p/$slug"}
              params={
                post.url ? { domain: post.domain } : { slug: post.place.slug }
              }
              className="text-xs text-muted-foreground ml-1.5 hover:underline"
            >
              ({post.domain})
            </Link>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          submitted{" "}
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}{" "}
          by{" "}
          <span className="text-foreground/80">
            {post.author.name || post.author.email}
          </span>
          {showPlace && (
            <>
              {" "}
              to{" "}
              <Link
                to="/p/$slug"
                params={{ slug: post.place.slug }}
                className="text-foreground/80 hover:underline"
              >
                p/{post.place.slug}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <Link
            to="/posts/$postId"
            params={{ postId: post.id }}
            className="hover:underline"
          >
            n comments
          </Link>
          <button type="button" className="hover:underline">
            share
          </button>
          <button type="button" className="hover:underline">
            save
          </button>
          {showEdit && (
            <Link
              to="/posts/$postId"
              params={{ postId: post.id }}
              className="hover:underline"
            >
              edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
