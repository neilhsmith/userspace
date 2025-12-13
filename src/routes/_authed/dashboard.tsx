import { createFileRoute, Link } from "@tanstack/react-router"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || user?.email}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {user?.name || "Not set"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Role:</span>{" "}
                <span className="capitalize">{user?.role}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts</CardTitle>
            <CardDescription>Create and manage your posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share your thoughts with the community by creating posts.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/posts/new">New Post</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/posts">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Administrative controls</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As an admin, you can edit and delete any post in the system.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

