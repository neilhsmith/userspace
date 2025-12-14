import { PostPreview } from "@/components/post-preview";
import type { Session } from "@/lib/auth-client";
import type { Post } from "@/lib/post";

type PostFeedProps = {
  posts: Post[] | undefined;
  currentUser?: Session["user"] | null;
  showPlace?: boolean;
  showDomainLink?: boolean;
  startIndex?: number;
};

export function PostFeed({
  posts,
  currentUser,
  showPlace,
  showDomainLink,
  startIndex = 1,
}: PostFeedProps) {
  return (
    <div className="divide-y divide-border">
      {posts?.map((post, i) => (
        <PostPreview
          key={post.id}
          post={post}
          index={startIndex + i}
          currentUser={currentUser}
          showPlace={showPlace}
          showDomainLink={showDomainLink}
        />
      ))}
    </div>
  );
}
