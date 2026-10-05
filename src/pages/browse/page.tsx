import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Unauthenticated } from "convex/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Search, Heart } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import LayoutShell from "@/components/LayoutShell.tsx";
import PlatformCard from "@/components/PlatformCard.tsx";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

const ALL_CATEGORIES = ["All", "Hosting", "AI", "Databases", "CI/CD", "Version Control", "Mobile", "CMS", "Auth", "Payments", "Package Managers", "Monitoring", "Email", "Design", "Cloud"];

function BrowseContent({ category, search }: { category: string; search: string }) {
  const { user, signin } = useAuth();
  const isAuthenticated = !!user;

  const platforms = useQuery(api.platforms.list, {
    category: category === "All" ? undefined : category,
    search: search || undefined,
  });
  const favoriteIds = useQuery(api.favorites.getUserFavorites, isAuthenticated ? {} : "skip");
  const toggleFavorite = useMutation(api.favorites.toggle);

  const handleToggle = async (id: Id<"platforms">) => {
    try { await toggleFavorite({ platformId: id }); }
    catch { toast.error("Failed to toggle favorite"); }
  };

  if (platforms === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-3xl mb-2">🔍</div>
        <p className="font-medium text-sm">No platforms found</p>
        <p className="text-xs mt-1">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      {platforms.map((platform) => (
        <PlatformCard
          key={platform._id}
          platform={platform}
          isFavorited={favoriteIds?.includes(platform._id)}
          onFavoriteToggle={isAuthenticated ? handleToggle : undefined}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const activeCategory = searchParams.get("category") ?? "All";
  const { signin } = useAuth();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchInput(q);
  }, []);

  const setCategory = (cat: string) => {
    setSearchParams((prev) => {
      if (cat === "All") prev.delete("category");
      else prev.set("category", cat);
      return prev;
    });
  };

  return (
    <LayoutShell>
      <div className="px-5 py-5">
        <h1 className="text-lg font-bold mb-4">Browse Platforms</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search platforms, tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <BrowseContent category={activeCategory} search={debouncedSearch} />

        <Unauthenticated>
          <div className="mt-8 flex items-center justify-between gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs font-medium">Sign in to save favorite platforms</p>
            </div>
            <Button size="sm" className="shrink-0 gap-1 text-xs" onClick={() => void signin()}>Sign in</Button>
          </div>
        </Unauthenticated>
      </div>
    </LayoutShell>
  );
}
