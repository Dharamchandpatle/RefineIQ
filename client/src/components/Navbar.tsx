import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.includes("/dashboard") || location.pathname === "/profile";

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <span className="text-sm font-semibold text-brand-blue">IOCL</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Indian Oil Corporation Ltd.</p>
            <h1 className="text-lg font-semibold text-brand-blue">RefineIQ</h1>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <span className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-brand-blue">
              {user.role}
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleToggle}
            className="text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          {isAuthenticated && isDashboard ? (
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-sm font-semibold text-brand-blue"
              aria-label="Profile"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Link>
          ) : null}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
              Sign Out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
