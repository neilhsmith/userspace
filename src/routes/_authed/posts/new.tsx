import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/server/posts";
import { getAllCommunities } from "@/server/communities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardForm,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  community: z.string().optional(),
});

export const Route = createFileRoute("/_authed/posts/new")({
  component: NewPostPage,
  validateSearch: searchSchema,
});

function NewPostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { community: preselectedCommunity } = Route.useSearch();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");

  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ["allCommunities"],
    queryFn: () => getAllCommunities(),
  });

  // Pre-select community if provided in URL (by slug)
  useEffect(() => {
    if (preselectedCommunity && communities) {
      const found = communities.find((c) => c.slug === preselectedCommunity);
      if (found) {
        setCommunityId(found.id);
      }
    }
  }, [preselectedCommunity, communities]);

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Post created successfully!");
      navigate({ to: "/posts/$postId", params: { postId: post.id } });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId) {
      toast.error("Please select a community");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mutation.mutate as any)({ data: { title, content, communityId } });
  };

  const selectedCommunity = communities?.find((c) => c.id === communityId);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Share your thoughts with the community
          </CardDescription>
        </CardHeader>
        <CardForm onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="community">Community</FieldLabel>
                {communitiesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading communities...
                  </p>
                ) : communities?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No communities yet.{" "}
                    <a
                      href="/communities/new"
                      className="text-primary hover:underline"
                    >
                      Create one
                    </a>
                  </p>
                ) : (
                  <select
                    id="community"
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    required
                    disabled={mutation.isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a community...</option>
                    {communities?.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                )}
                {selectedCommunity && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Posting to {selectedCommunity.name} (c/
                    {selectedCommunity.slug})
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="content">Content</FieldLabel>
                <Textarea
                  id="content"
                  placeholder="Write your post content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={mutation.isPending}
                  rows={10}
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="submit"
              disabled={
                mutation.isPending || !communityId || communitiesLoading
              }
            >
              {mutation.isPending ? "Creating..." : "Create Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/posts" })}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </CardFooter>
        </CardForm>
      </Card>
    </div>
  );
}
