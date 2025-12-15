import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, updatePost, deletePost } from "@/server/posts";
import { useSession } from "@/lib/auth-client";
import { canEditPost, canDeletePost } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { safeHref } from "@/lib/utils";
import { VoteButtons } from "@/components/vote-buttons";

export const Route = createFileRoute("/posts/$postId")({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost({ data: { id: postId } }),
  });

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully!");
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const handleEdit = () => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || "");
      setUrl(post.url || "");
      setIsEditing(true);
    }
  };

  const isLinkPost = post?.url && !post?.content;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const data = isLinkPost
      ? { id: postId, title, url }
      : { id: postId, title, content };
    updateMutation.mutate({ data });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate({ data: { id: postId } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">Post not found</p>
        <Button asChild>
          <Link to="/">Back to Posts</Link>
        </Button>
      </div>
    );
  }

  const canEdit = user && canEditPost(user, post);
  const canDelete = user && canDeletePost(user, post);

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
            <CardDescription>Update your post content</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
              {isLinkPost ? (
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    disabled={updateMutation.isPending}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={updateMutation.isPending}
                    rows={10}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              <VoteButtons
                post={post}
                isAuthenticated={!!user}
                orientation="vertical"
                size="md"
              />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-2xl">
                {post.url ? (
                  <>
                    <a
                      href={safeHref(post.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {post.title}
                    </a>
                    <Link
                      to="/domain/$domain"
                      params={{ domain: post.domain }}
                      className="text-base font-normal text-muted-foreground ml-2 hover:underline"
                    >
                      ({post.domain})
                    </Link>
                  </>
                ) : (
                  <>
                    {post.title}
                    <Link
                      to="/p/$slug"
                      params={{ slug: post.place.slug }}
                      className="text-base font-normal text-muted-foreground ml-2 hover:underline"
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
                <span>{post.author.name || post.author.email}</span>
                <span>·</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {post.content && (
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        )}
        <Separator />
        <CardFooter className="flex justify-between pt-4">
          <Button asChild variant="ghost">
            <Link to="/">← Back to Posts</Link>
          </Button>
          {(canEdit || canDelete) && (
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" onClick={handleEdit}>
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
