import { Link, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { TerminalSquare, BookOpen, Heart, ChevronRight, Code2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";

function FavoritesNavItem({ isActive }: { isActive: boolean }) {
  const favoriteIds = useQuery(api.favorites.getUserFavorites);
  const count = favoriteIds?.length ?? 0;

  return (
    <Link
      to="/favorites"
      className={cn(
        "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <Heart className={cn("w-3.5 h-3.5", count > 0 && "fill-red-500 text-red-500")} />
      Favorites
      {count > 0 && (
        <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { signout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <TerminalSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm hidden sm:block">Dev Platforms</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            to="/templates"
            className={cn(
              "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors",
              location.pathname === "/templates"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            Templates
          </Link>

          <Link
            to="/browse"
            className={cn(
              "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors",
              location.pathname === "/browse"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse
          </Link>

          {/* Favorites with badge (authenticated only) */}
          <Authenticated>
            <FavoritesNavItem isActive={location.pathname === "/favorites"} />
          </Authenticated>
          <Unauthenticated>
            <Link
              to="/favorites"
              className={cn(
                "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors",
                location.pathname === "/favorites"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </Link>
          </Unauthenticated>
        </nav>

        {/* Auth */}
        <div className="shrink-0">
          <Authenticated>
            <Button variant="ghost" size="sm" onClick={signout} className="text-muted-foreground text-xs">
              Sign out
            </Button>
          </Authenticated>
          <Unauthenticated>
            <SignInButton>
              <Button size="sm" className="gap-1 text-xs">
                Sign in <ChevronRight className="w-3 h-3" />
              </Button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
