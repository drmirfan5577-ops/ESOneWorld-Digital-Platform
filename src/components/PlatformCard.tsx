import { Link } from "react-router-dom";
import { ExternalLink, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

const PRICING_COLORS: Record<string, string> = {
  free: "bg-emerald-100 text-emerald-700",
  freemium: "bg-blue-100 text-blue-700",
  paid: "bg-amber-100 text-amber-700",
  "open-source": "bg-purple-100 text-purple-700",
};

type Props = {
  platform: Doc<"platforms">;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: Doc<"platforms">["_id"]) => void;
  isAuthenticated?: boolean;
};

export default function PlatformCard({ platform, isFavorited, onFavoriteToggle, isAuthenticated }: Props) {
  return (
    <div className="group relative flex flex-col bg-card border rounded-xl p-3.5 hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      {/* Logo + Name row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ background: platform.logoColor ? `${platform.logoColor}18` : "oklch(0.94 0.01 265)" }}
          >
            {platform.logoEmoji ?? "📦"}
          </div>
          <div className="min-w-0">
            <Link
              to={`/platform/${platform.slug}`}
              className="font-semibold text-xs leading-tight hover:text-primary transition-colors block truncate"
            >
              {platform.name}
            </Link>
            <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block", PRICING_COLORS[platform.pricing])}>
              {platform.pricing}
            </span>
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => { if (isAuthenticated && onFavoriteToggle) onFavoriteToggle(platform._id); }}
          title={isAuthenticated ? (isFavorited ? "Remove" : "Save") : "Sign in to save"}
          className={cn(
            "p-1 rounded-md transition-colors cursor-pointer shrink-0 ml-1",
            isFavorited ? "text-red-500 bg-red-50" : "text-muted-foreground/40 hover:text-red-400 hover:bg-red-50"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
        </button>
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2 flex-1">
        {platform.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {platform.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Heart className="w-2.5 h-2.5" />
          <span>{platform.favoritesCount}</span>
        </div>
        <a
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
        >
          Visit <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
