import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { SubscribeButton } from "@/components/subscribe-button";

type Place = {
  id: string;
  name: string;
  slug: string;
  moderator: { id: string; name: string | null; email: string };
  _count: { posts: number };
};

type SidebarPlaceProps = {
  place: Place;
};

export function SidebarPlace({ place }: SidebarPlaceProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{place.name}</CardTitle>
        <p className="text-sm text-muted-foreground">p/{place.slug}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            {place._count.posts} {place._count.posts === 1 ? "post" : "posts"}
          </p>
          <p>Moderated by {place.moderator.name || place.moderator.email}</p>
        </div>

        {user && (
          <SubscribeButton
            placeId={place.id}
            placeName={place.name}
            variant="button"
          />
        )}

        {user ? (
          <Button asChild className="w-full">
            <Link to="/posts/new" search={{ place: place.slug }}>
              Create Post
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link to="/signup">Create Post</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
