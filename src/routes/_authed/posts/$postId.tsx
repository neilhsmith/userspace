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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authed/posts/$postId")({
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

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => (getPost as any)({ data: { id: postId } }),
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
      navigate({ to: "/posts" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const handleEdit = () => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setIsEditing(true);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updateMutation.mutate as any)({ data: { id: postId, title, content } });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (deleteMutation.mutate as any)({ data: { id: postId } });
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
          <Link to="/posts">Back to Posts</Link>
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
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{post.title}</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between pt-4">
          <Button asChild variant="ghost">
            <Link to="/posts">← Back to Posts</Link>
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
