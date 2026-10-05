import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import LayoutShell from "@/components/LayoutShell.tsx";
import PlatformCard from "@/components/PlatformCard.tsx";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

function FavoritesList() {
  const favoriteIds = useQuery(api.favorites.getUserFavorites);
  const allPlatforms = useQuery(api.platforms.list, {});
  const toggleFavorite = useMutation(api.favorites.toggle);

  const handleToggle = async (id: Id<"platforms">) => {
    try { await toggleFavorite({ platformId: id }); }
    catch { toast.error("Failed to toggle favorite"); }
  };

  if (favoriteIds === undefined || allPlatforms === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    );
  }

  const favorites = allPlatforms.filter((p) => favoriteIds.includes(p._id));

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-red-300" />
        </div>
        <h3 className="font-semibold mb-1">No favorites yet</h3>
        <p className="text-xs text-muted-foreground max-w-xs mb-5">Browse platforms and click the heart to save</p>
        <Button asChild size="sm" className="gap-2">
          <Link to="/browse"><BookOpen className="w-4 h-4" /> Browse platforms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {favorites.map((platform) => (
        <PlatformCard
          key={platform._id}
          platform={platform}
          isFavorited={true}
          onFavoriteToggle={handleToggle}
          isAuthenticated={true}
        />
      ))}
    </div>
  );
}

export default function Favorites() {
  const { signin } = useAuth();
  return (
    <LayoutShell>
      <div className="px-5 py-5">
        <h1 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" /> My Favorites
        </h1>

        <AuthLoading>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        </AuthLoading>
        <Authenticated><FavoritesList /></Authenticated>
        <Unauthenticated>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-primary/40" />
            </div>
            <h3 className="font-semibold mb-1">Sign in to see favorites</h3>
            <p className="text-xs text-muted-foreground max-w-xs mb-5">Save platforms from any device</p>
            <Button className="gap-2" onClick={() => void signin()}><Heart className="w-4 h-4" /> Sign in</Button>
          </div>
        </Unauthenticated>
      </div>
    </LayoutShell>
  );
}
