import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlace } from "@/server/places";
import { generateSlug } from "@/lib/place";
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

export const Route = createFileRoute("/_authed/places/new")({
  component: NewPlacePage,
});

function NewPlacePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const slug = generateSlug(name);

  const mutation = useMutation({
    mutationFn: createPlace,
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ["topPlaces"] });
      queryClient.invalidateQueries({ queryKey: ["allPlaces"] });
      toast.success("Place created successfully!");
      navigate({ to: "/p/$slug", params: { slug: place.slug } });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create place");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ data: { name } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Place</CardTitle>
          <CardDescription>
            Start a new place and become its moderator
          </CardDescription>
        </CardHeader>
        <CardForm onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Place Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="My Awesome Place"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
                {name && slug && (
                  <p className="text-sm text-muted-foreground mt-2">
                    URL: <span className="font-mono">p/{slug}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Choose a name for your place. It will be displayed as-is,
                  and a URL-friendly slug will be generated automatically.
                </p>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending || !slug}>
              {mutation.isPending ? "Creating..." : "Create Place"}
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
