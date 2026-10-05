import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, TerminalSquare, Zap, Search, Heart, Smartphone, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import LayoutShell from "@/components/LayoutShell.tsx";
import PlatformCard from "@/components/PlatformCard.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

const QUICK_LINKS = [
  { label: "Browse All", to: "/browse", icon: <Search className="w-4 h-4" />, color: "bg-blue-500" },
  { label: "Templates", to: "/templates", icon: <Code2 className="w-4 h-4" />, color: "bg-purple-500" },
  { label: "Android", to: "/android", icon: <Smartphone className="w-4 h-4" />, color: "bg-green-500" },
  { label: "Favorites", to: "/favorites", icon: <Heart className="w-4 h-4" />, color: "bg-red-500" },
];

function FeaturedSection() {
  const { user, signin } = useAuth();
  const isAuthenticated = !!user;
  const featured = useQuery(api.platforms.getFeatured);
  const favoriteIds = useQuery(api.favorites.getUserFavorites, isAuthenticated ? {} : "skip");
  const toggleFavorite = useMutation(api.favorites.toggle);

  const handleToggle = async (id: Id<"platforms">) => {
    try { await toggleFavorite({ platformId: id }); }
    catch { toast.error("Sign in to save favorites"); }
  };

  if (featured === undefined) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {featured.map((platform: Doc<"platforms">, i: number) => (
        <motion.div
          key={platform._id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" as const }}
        >
          <PlatformCard
            platform={platform}
            isFavorited={favoriteIds?.includes(platform._id)}
            onFavoriteToggle={isAuthenticated ? handleToggle : undefined}
            isAuthenticated={isAuthenticated}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function Index() {
  const { signin } = useAuth();
  const seedPlatforms = useMutation(api.seed.addMissingPlatforms);
  useEffect(() => { seedPlatforms().catch(() => null); }, [seedPlatforms]);

  return (
    <LayoutShell>
      <div className="px-5 py-6 max-w-4xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-3">
            <Zap className="w-3 h-3" /> 44+ platforms curated for devs
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            The Developer{"'"}s <span className="text-primary">Platform Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg">
            Discover, compare, and save the best developer platforms — all in one place.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/browse"><Search className="w-3.5 h-3.5" /> Browse</Link>
            </Button>
            <Unauthenticated>
              <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => void signin()}>
                <Heart className="w-3.5 h-3.5" /> Sign in to Save
              </Button>
            </Unauthenticated>
            <Authenticated>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <Link to="/favorites"><Heart className="w-3.5 h-3.5" /> My Favorites</Link>
              </Button>
            </Authenticated>
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7">
          {QUICK_LINKS.map(({ label, to, icon, color }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" as const }}
            >
              <Link
                to={to}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-card border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
              >
                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0", color)}>
                  {icon}
                </span>
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</span>
                <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">Featured Platforms</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground text-xs">
            <Link to="/browse">View all <ArrowRight className="w-3 h-3" /></Link>
          </Button>
        </div>
        <FeaturedSection />
      </div>
    </LayoutShell>
  );
}
