import type { Session } from "@/lib/auth-client";
import { PostPreview, type PostPreviewPost } from "@/components/post-preview";

type PostFeedProps = {
  posts: PostPreviewPost[] | undefined;
  currentUser?: Session["user"] | null;
  showPlaceChip?: boolean;
  showDomainLink?: boolean;
  pendingReadMore?: boolean;
};

export function PostFeed({
  posts,
  currentUser,
  showPlaceChip,
  showDomainLink,
  pendingReadMore,
}: PostFeedProps) {
  return (
    <div className="grid gap-4">
      {posts?.map((post) => (
        <PostPreview
          key={post.id}
          post={post}
          currentUser={currentUser}
          showPlaceChip={showPlaceChip}
          showDomainLink={showDomainLink}
          pendingReadMore={pendingReadMore}
        />
      ))}
    </div>
  );
}
