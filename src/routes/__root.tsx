import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
  MatchRoute,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NavigationProgress } from "@/components/navigation-progress";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "@/components/ui/sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getTopPlaces } from "@/server/places";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Userspace",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function PlaceBar() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: places } = useQuery({
    queryKey: ["topPlaces"],
    queryFn: () => getTopPlaces(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  return (
    <div className="bg-muted/50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-8 gap-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
            <span className="text-xs text-muted-foreground shrink-0 mr-1">
              places:
            </span>
            {places?.map((place) => (
              <Link
                key={place.id}
                to="/p/$slug"
                params={{ slug: place.slug }}
                className="text-xs px-2 py-0.5 rounded hover:bg-muted transition-colors shrink-0"
                activeProps={{ className: "bg-muted font-medium" }}
              >
                {place.name}
              </Link>
            ))}
          </div>
          {user && (
            <Link
              to="/places/new"
              className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
            >
              + Create place
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold active:opacity-70 transition-opacity"
          >
            Userspace
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-all active:opacity-70"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                <MatchRoute to="/dashboard" pending>
                  {(match) => (
                    <span className={match ? "animate-pulse" : ""}>
                      Dashboard
                    </span>
                  )}
                </MatchRoute>
              </Link>
              <Link
                to="/posts"
                className="text-sm text-muted-foreground hover:text-foreground transition-all active:opacity-70"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                <MatchRoute to="/posts" pending>
                  {(match) => (
                    <span className={match ? "animate-pulse" : ""}>Posts</span>
                  )}
                </MatchRoute>
              </Link>
            </>
          )}
        </nav>

        {isPending ? (
          <div className="h-8 w-8" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || ""}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {(user?.role === "global_admin" ||
                    user?.role === "admin") && (
                    <span className="text-xs text-primary font-medium">
                      {user?.role === "global_admin" ? "Global Admin" : "Admin"}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/posts/new">New Post</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/places/new">New Place</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login" search={{ redirect: location.pathname }}>
                Sign in
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function RootComponent() {
  return (
    <div className="min-h-screen bg-background">
      <PlaceBar />
      <Header />
      <NavigationProgress />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
