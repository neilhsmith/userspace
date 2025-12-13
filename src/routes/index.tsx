import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const { data: session, isPending } = useSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Welcome to Userspace
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          A full-stack application with authentication, role-based access control,
          and a post system built with TanStack Start, Better Auth, and Prisma.
        </p>
        <div className="flex gap-4 justify-center">
          {isPending ? (
            <Button disabled>Loading...</Button>
          ) : session ? (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/signup">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
