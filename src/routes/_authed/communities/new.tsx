import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommunity } from "@/server/communities";
import { generateSlug, normalizeCommunityName } from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authed/communities/new")({
  component: NewCommunityPage,
});

function NewCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const normalizedName = normalizeCommunityName(name);
  const slug = generateSlug(name);

  const mutation = useMutation({
    mutationFn: createCommunity,
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: ["topCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
      toast.success("Community created successfully!");
      navigate({ to: "/c/$slug", params: { slug: community.slug } });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create community");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mutation.mutate as any)({ data: { name } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Community</CardTitle>
          <CardDescription>
            Start a new community and become its moderator
          </CardDescription>
        </CardHeader>
        <CardForm onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Community Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="My Awesome Community"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
                {name && slug && (
                  <p className="text-sm text-muted-foreground mt-2">
                    URL: <span className="font-mono">c/{slug}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Choose a name for your community. It will be displayed as-is,
                  and a URL-friendly slug will be generated automatically.
                </p>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending || !slug}>
              {mutation.isPending ? "Creating..." : "Create Community"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/" })}
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
