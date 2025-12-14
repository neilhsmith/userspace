import { useState } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Mail } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      setMobileMenuOpen(false);
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo and nav */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold active:opacity-70 transition-opacity"
          >
            Userspace
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-4">
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
            </div>
          )}
        </nav>

        {/* Right side - Desktop account bar */}
        <div className="hidden md:flex items-center text-xs">
          {isPending ? (
            <div className="h-4 w-20" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <a
                href="#"
                className="text-foreground hover:underline font-medium"
                onClick={(e) => e.preventDefault()}
              >
                {user.name || user.email?.split("@")[0]}
              </a>
              <span className="text-muted-foreground">(1)</span>
              <span className="text-muted-foreground mx-1">|</span>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground hover:underline"
                onClick={(e) => e.preventDefault()}
                title="messages"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <span className="text-muted-foreground mx-1">|</span>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                preferences
              </a>
              <span className="text-muted-foreground mx-1">|</span>
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
              >
                logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Want to join?</span>
              <Link
                to="/login"
                search={{ redirect: location.pathname }}
                className="text-foreground hover:underline font-medium ml-1"
              >
                Log in
              </Link>
              <span className="text-muted-foreground">or</span>
              <Link
                to="/signup"
                className="text-foreground hover:underline font-medium"
              >
                sign up
              </Link>
              <span className="text-muted-foreground">in seconds.</span>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {/* Navigation links */}
                <div className="flex flex-col gap-2">
                  <Link
                    to="/"
                    className="text-sm hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  {user && (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-sm hover:underline"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/posts"
                        className="text-sm hover:underline"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Posts
                      </Link>
                      <Link
                        to="/posts/new"
                        className="text-sm hover:underline"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        New Post
                      </Link>
                      <Link
                        to="/places/new"
                        className="text-sm hover:underline"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        New Place
                      </Link>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Auth section */}
                {isPending ? (
                  <div className="h-8" />
                ) : user ? (
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {user.name || user.email?.split("@")[0]}
                      </span>
                      <span className="text-muted-foreground">(1)</span>
                    </div>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Mail className="h-4 w-4" />
                      Messages
                    </a>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => e.preventDefault()}
                    >
                      Preferences
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="text-left text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="text-muted-foreground">
                      Want to join? Log in or sign up in seconds.
                    </p>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          to="/login"
                          search={{ redirect: location.pathname }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link
                          to="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
