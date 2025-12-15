import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Welcome to Userspace. Browse posts from various places and domains.
        </p>
      </CardContent>
    </Card>
  );
}
