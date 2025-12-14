import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/server/posts";
import { getAllPlaces } from "@/server/places";
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
  place: z.string().optional(),
});

export const Route = createFileRoute("/_authed/posts/new")({
  component: NewPostPage,
  validateSearch: searchSchema,
});

type PostType = "text" | "link";

function NewPostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { place: preselectedPlace } = Route.useSearch();

  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [placeId, setPlaceId] = useState("");

  const { data: places, isLoading: placesLoading } = useQuery({
    queryKey: ["allPlaces"],
    queryFn: () => getAllPlaces(),
  });

  // Pre-select place if provided in URL (by slug)
  useEffect(() => {
    if (preselectedPlace && places) {
      const found = places.find((p) => p.slug === preselectedPlace);
      if (found) {
        setPlaceId(found.id);
      }
    }
  }, [preselectedPlace, places]);

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["placePosts"] });
      queryClient.invalidateQueries({ queryKey: ["domainPosts", post.domain] });
      toast.success("Post created successfully!");
      navigate({ to: "/posts/$postId", params: { postId: post.id } });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId) {
      toast.error("Please select a place");
      return;
    }
    const data =
      postType === "text"
        ? { title, content, placeId }
        : { title, url, placeId };
    mutation.mutate({ data });
  };

  const selectedPlace = places?.find((p) => p.id === placeId);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>Share your thoughts with the place</CardDescription>
        </CardHeader>
        <CardForm onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="place">Place</FieldLabel>
                {placesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading places...
                  </p>
                ) : places?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No places yet.{" "}
                    <a
                      href="/places/new"
                      className="text-primary hover:underline"
                    >
                      Create one
                    </a>
                  </p>
                ) : (
                  <select
                    id="place"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    required
                    disabled={mutation.isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a place...</option>
                    {places?.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                )}
                {selectedPlace && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Posting to {selectedPlace.name} (p/
                    {selectedPlace.slug})
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel>Post Type</FieldLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={postType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("text")}
                    disabled={mutation.isPending}
                  >
                    Text
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "link" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("link")}
                    disabled={mutation.isPending}
                  >
                    Link
                  </Button>
                </div>
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
              {postType === "text" ? (
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
              ) : (
                <Field>
                  <FieldLabel htmlFor="url">URL</FieldLabel>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    disabled={mutation.isPending}
                  />
                </Field>
              )}
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="submit"
              disabled={mutation.isPending || !placeId || placesLoading}
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
