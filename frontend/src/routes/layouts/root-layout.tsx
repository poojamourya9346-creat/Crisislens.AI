import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Cpu, BellRing, UserCircle2, X, Menu,
  MapPin, BarChart3, Eye, LayoutDashboard, FileEdit
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IncidentRecord } from "@/features/incident-dashboard/types";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { to: "/",          label: "Intake",    icon: FileEdit },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map",       label: "GIS Map",   icon: MapPin },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/vision",    label: "AI Vision", icon: Eye },
];

const pageLabels: Record<string, string> = {
  "/dashboard": "Command Center",
  "/map":       "GIS Map Ops",
  "/analytics": "Intelligence Ops",
  "/vision":    "Vision Analytics",
  "/":          "Incident Intake",
};

export function RootLayout() {
  const location = useLocation();
  const [incidents] = useLocalStorage<IncidentRecord[]>("crisislens.incidents", []);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const pageLabel = pageLabels[location.pathname] ?? "Incident Intake";

  const alerts = useMemo(() => {
    const list: { id: string; title: string; description: string; type: string; time: string }[] = [];
    const sorted = [...incidents].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (const inc of sorted) {
      if (inc.risk_score >= 80) {
        list.push({
          id:          `${inc.id}-critical`,
          title:       "Critical Risk Alert",
          description: `Risk score ${inc.risk_score}/100 on "${inc.title}"`,
          type:        "danger",
          time:        new Date(inc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
      list.push({
        id:          `${inc.id}-report`,
        title:       "Intake Processed",
        description: `"${inc.title}" — AI analysis complete`,
        type:        "info",
        time:        new Date(inc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    if (list.length === 0) {
      list.push({
        id:          "default-1",
        title:       "System Initialized",
        description: "CrisisLens AI Command Center ready.",
        type:        "success",
        time:        "Now",
      });
    }
    return list.slice(0, 8);
  }, [incidents]);

  const visibleAlerts = useMemo(
    () => alerts.filter(a => !dismissedIds.has(a.id)),
    [alerts, dismissedIds]
  );

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const markAllRead = () => {
    setDismissedIds(new Set(alerts.map(a => a.id)));
  };

  const criticalCount = useMemo(
    () => incidents.filter(i => i.risk_score >= 80 && i.status !== "resolved").length,
    [incidents]
  );

  const unreadCount = visibleAlerts.length;

  return (
    <div className="min-h-screen bg-transparent text-[#F8FAFC]">
      {/* ── Floating Glass Navbar ── */}
      <div className="sticky top-0 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <header className="rounded-2xl border border-white/[0.06] bg-[#151C28]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset]">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">

            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-lg shadow-[#3B82F6]/25 border border-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold tracking-tight text-white leading-none">CrisisLens AI</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#60A5FA]/80 mt-1">Enterprise Intelligence</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 rounded-xl border border-white/[0.06] bg-[#111827]/40 p-1 backdrop-blur-md">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isCurrent = location.pathname === to || (to === "/" && location.pathname === "");
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className="relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all text-[#CBD5E1] hover:text-white"
                  >
                    {isCurrent && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08] shadow-[0_2px_12px_rgba(255,255,255,0.02)] -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* System status pill */}
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3.5 py-1.5 text-xs font-semibold text-[#10B981] backdrop-blur-sm shadow-[0_2px_8px_rgba(16,185,129,0.05)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] glow-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                Ops System Online
              </div>

              {/* Current page label */}
              <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#111827]/40 px-3.5 py-1.5 text-xs font-semibold text-[#CBD5E1]">
                <Cpu className="h-3.5 w-3.5 text-[#94A3B8]" />
                {pageLabel}
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-[#111827]/40 text-[#CBD5E1] hover:bg-[#1B2433]/60 hover:text-white hover:border-white/[0.12] transition-all cursor-pointer shadow-sm"
                  onClick={() => { setShowNotifications(p => !p); setShowMobileMenu(false); }}
                >
                  <BellRing className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className={`absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-md ${criticalCount > 0 ? "bg-[#DC2626] badge-critical" : "bg-[#3B82F6]"}`}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/[0.07] bg-[#151C28]/95 shadow-[0_32px_80px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-2xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3 bg-gradient-to-b from-white/[0.03] to-transparent">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Telemetry Feeds</span>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <Badge tone="info">{unreadCount} New</Badge>
                          )}
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllRead}
                              className="text-[10px] font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors cursor-pointer"
                            >
                              Dismiss all
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#94A3B8] bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                            aria-label="Close notifications"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04] bg-[#111827]/40">
                        {visibleAlerts.length === 0 ? (
                          <div className="flex flex-col items-center gap-1 py-10 text-[#94A3B8]">
                            <span className="text-xs font-semibold text-[#F8FAFC]">Operational Center Clear</span>
                            <span className="text-[10px] text-[#94A3B8]/60">No active alerts require triage.</span>
                          </div>
                        ) : (
                          visibleAlerts.map(alert => (
                            <div key={alert.id} className="group px-4 py-3 hover:bg-white/[0.03] transition-colors relative">
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-semibold ${alert.type === "danger" ? "text-[#EF4444]" : "text-[#3B82F6]"}`}>
                                    {alert.title}
                                  </p>
                                  <p className="mt-1 text-[11px] text-[#CBD5E1] leading-snug font-medium">{alert.description}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                  <span className="text-[9px] font-semibold text-[#94A3B8]/60 uppercase">{alert.time}</span>
                                  <button
                                    type="button"
                                    onClick={() => dismissAlert(alert.id)}
                                    className="flex h-5 w-5 items-center justify-center rounded-md text-[#94A3B8] hover:bg-white/[0.05] hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                    aria-label="Dismiss notification"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-[#111827]/40 text-[#CBD5E1] shadow-inner">
                <UserCircle2 className="h-5 w-5" />
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="flex h-10 w-10 md:hidden items-center justify-center rounded-xl border border-white/[0.06] bg-[#111827]/40 text-[#CBD5E1] hover:bg-[#1B2433] transition-colors cursor-pointer"
                onClick={() => { setShowMobileMenu(p => !p); setShowNotifications(false); }}
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/[0.05] md:hidden overflow-hidden bg-[#151C28]/95 backdrop-blur-2xl"
              >
                <nav className="flex flex-col gap-1 p-3">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      onClick={() => setShowMobileMenu(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-white/[0.08] text-white border border-white/[0.08]"
                            : "text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* ── Main content with page transition ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="page-enter"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
