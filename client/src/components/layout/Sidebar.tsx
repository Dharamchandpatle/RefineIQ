/**
 * Sidebar Navigation Component
 * Main navigation for the refinery dashboard
 */

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Factory,
    LayoutDashboard,
    LogOut,
    Settings,
    TrendingUp,
    UserCircle,
    Zap
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/units",
    label: "Unit Details",
    icon: Factory,
  },
  {
    path: "/alerts",
    label: "Alerts",
    icon: AlertTriangle,
  },
  {
    path: "/predictions",
    label: "Predictions",
    icon: TrendingUp,
  },
  {
    path: "/profile",
    label: "My Profile",
    icon: UserCircle,
  },
  {
    path: "/admin",
    label: "Admin Panel",
    icon: Settings,
  },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-50 border-r border-slate-200"
      style={{ backgroundColor: '#FFFEF7' }}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 mb-8 group">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFPC-soVqmkNILA6QUDqpv9ZRMbkunkW6TRw&s" 
                alt="IOCL Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-xs text-muted-foreground mb-1">
                  Indian Oil Corporation Ltd.
                </span>
                <span className="font-orbitron font-bold text-lg text-gradient-primary">
                  RefineIQ
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative shadow-sm border",
                  isActive
                    ? "bg-[#F37021] text-white font-semibold border-[#F37021] shadow-md hover:bg-[#003A8F] hover:border-[#003A8F] hover:shadow-lg hover:scale-105"
                    : "bg-white text-slate-600 font-medium border-slate-200 hover:border-[#003A8F] hover:bg-[#003A8F] hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                  )}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="pt-4 border-t border-slate-200">
          <AnimatePresence>
            {!collapsed && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-3 py-2 mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Theme Toggle */}
          <div className="flex items-center justify-center pt-2 border-t border-slate-200">
            <ThemeToggle className="hover:bg-amber-50 hover:text-amber-600" />
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
