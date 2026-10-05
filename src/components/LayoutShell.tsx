import { Link, useLocation, useNavigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuth } from "@/hooks/use-auth.ts";
import { cn } from "@/lib/utils.ts";
import {
  TerminalSquare, Home, Compass, Heart, Code2, Smartphone,
  LogOut, LogIn, ChevronRight, Cpu, Globe, Database, Shield,
  CreditCard, Package, GitBranch, Layers, Mail, Palette, Cloud,
  Activity, Bot,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/browse", icon: Compass, label: "Browse" },
  { to: "/templates", icon: Code2, label: "Templates" },
  { to: "/android", icon: Smartphone, label: "Android" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
];

const CATEGORIES = [
  { label: "Hosting", Icon: Globe },
  { label: "AI", Icon: Bot },
  { label: "Databases", Icon: Database },
  { label: "CI/CD", Icon: Cpu },
  { label: "Version Control", Icon: GitBranch },
  { label: "Mobile", Icon: Smartphone },
  { label: "CMS", Icon: Layers },
  { label: "Auth", Icon: Shield },
  { label: "Payments", Icon: CreditCard },
  { label: "Package Managers", Icon: Package },
  { label: "Design", Icon: Palette },
  { label: "Cloud", Icon: Cloud },
  { label: "Monitoring", Icon: Activity },
  { label: "Email", Icon: Mail },
];

function FavCount() {
  const ids = useQuery(api.favorites.getUserFavorites);
  const count = ids?.length ?? 0;
  if (!count) return null;
  return (
    <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function AuthSection() {
  const { signout, signin } = useAuth();

  return (
    <>
      <AuthLoading>
        <Skeleton className="h-8 rounded-lg bg-white/10" />
      </AuthLoading>
      <Authenticated>
        <button
          onClick={signout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </Authenticated>
      <Unauthenticated>
        <button
          onClick={() => void signin()}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs bg-[oklch(0.55_0.22_264)] text-white hover:bg-[oklch(0.48_0.22_264)] transition-colors cursor-pointer font-semibold"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
        </button>
      </Unauthenticated>
    </>
  );
}

function MobileAuthButton() {
  const { signout, signin } = useAuth();
  return (
    <>
      <AuthLoading>
        <Skeleton className="h-7 w-16 rounded" />
      </AuthLoading>
      <Authenticated>
        <button onClick={signout} className="text-white/70 hover:text-white text-xs font-medium cursor-pointer">
          Sign Out
        </button>
      </Authenticated>
      <Unauthenticated>
        <button
          onClick={() => void signin()}
          className="bg-[oklch(0.55_0.22_264)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[oklch(0.48_0.22_264)] transition-colors"
        >
          Sign In
        </button>
      </Unauthenticated>
    </>
  );
}

type LayoutShellProps = {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
};

export default function LayoutShell({ children, rightPanel }: LayoutShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── LEFT SIDEBAR ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 border-r bg-[oklch(0.18_0.045_264)] text-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[oklch(0.55_0.22_264)] flex items-center justify-center shrink-0">
            <TerminalSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-[13px] text-white/90 leading-tight">Dev Platforms</p>
            <p className="text-white/40 text-[10px]">Hub</p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main nav */}
          <nav className="flex flex-col gap-0.5 px-2 pt-3 pb-2">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors",
                    active ? "bg-[oklch(0.55_0.22_264)] text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                  {label === "Favorites" && (
                    <Authenticated>
                      <FavCount />
                    </Authenticated>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="h-px bg-white/10 mx-3 my-2" />

          {/* Category shortcuts */}
          <div className="px-2 pb-3">
            <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2 px-2 font-semibold">Categories</p>
            {CATEGORIES.map(({ label, Icon }) => (
              <button
                key={label}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(label)}`)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Icon className="w-3 h-3 shrink-0 opacity-70" />
                <span className="truncate">{label}</span>
                <ChevronRight className="w-2.5 h-2.5 ml-auto opacity-20 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Auth at bottom */}
        <div className="border-t border-white/10 px-3 py-3 shrink-0">
          <AuthSection />
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ───────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12 bg-[oklch(0.18_0.045_264)] border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <TerminalSquare className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm">Dev Platforms</span>
        </Link>
        <MobileAuthButton />
      </div>

      {/* ── MAIN + RIGHT ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto pt-12 md:pt-0">
          {children}
        </main>

        {rightPanel && (
          <aside className="hidden lg:flex flex-col w-60 shrink-0 border-l bg-card overflow-y-auto">
            {rightPanel}
          </aside>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-14 bg-white border-t shadow-lg">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
