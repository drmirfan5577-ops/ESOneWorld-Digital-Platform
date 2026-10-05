import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useParams, Link } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowLeft, ExternalLink, Heart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import LayoutShell from "@/components/LayoutShell.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

const PRICING_COLORS: Record<string, string> = {
  free: "bg-emerald-100 text-emerald-700",
  freemium: "bg-blue-100 text-blue-700",
  paid: "bg-amber-100 text-amber-700",
  "open-source": "bg-purple-100 text-purple-700",
};

function FavoriteButton({ platformId }: { platformId: Id<"platforms"> }) {
  const favoriteIds = useQuery(api.favorites.getUserFavorites);
  const toggleFavorite = useMutation(api.favorites.toggle);
  const isFavorited = favoriteIds?.includes(platformId);

  return (
    <Button
      onClick={async () => { try { await toggleFavorite({ platformId }); } catch { toast.error("Failed"); } }}
      variant="secondary"
      size="sm"
      className={cn("gap-1.5", isFavorited && "text-red-500")}
    >
      <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
      {isFavorited ? "Favorited" : "Save"}
    </Button>
  );
}

export default function PlatformDetail() {
  const { slug } = useParams<{ slug: string }>();
  const platform = useQuery(api.platforms.getBySlug, { slug: slug ?? "" });

  if (platform === undefined) {
    return (
      <LayoutShell>
        <div className="px-5 py-5">
          <Skeleton className="h-7 w-28 mb-5" />
          <Skeleton className="h-36 rounded-xl mb-4" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </LayoutShell>
    );
  }

  if (!platform) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center py-20 text-center px-5">
          <div>
            <p className="text-3xl mb-3">😕</p>
            <p className="font-semibold text-sm">Platform not found</p>
            <Button asChild variant="ghost" size="sm" className="mt-3">
              <Link to="/browse">Back to Browse</Link>
            </Button>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="px-5 py-5 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-1 mb-4 text-muted-foreground text-xs">
          <Link to="/browse"><ArrowLeft className="w-3.5 h-3.5" /> Browse</Link>
        </Button>

        <div className="bg-card border rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: platform.logoColor ? `${platform.logoColor}18` : "oklch(0.94 0.01 265)" }}
            >
              {platform.logoEmoji ?? "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{platform.name}</h1>
              <div className="flex items-center flex-wrap gap-1.5 mt-1">
                <Badge variant="secondary" className="text-xs">{platform.category}</Badge>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", PRICING_COLORS[platform.pricing])}>
                  {platform.pricing}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5" /> {platform.favoritesCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{platform.longDescription ?? platform.description}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {platform.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-1.5 text-xs">
              <a href={platform.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" /> Visit {platform.name}
              </a>
            </Button>
            <Authenticated><FavoriteButton platformId={platform._id} /></Authenticated>
            <Unauthenticated>
              <SignInButton>
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <Heart className="w-3.5 h-3.5" /> Sign in to Save
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
