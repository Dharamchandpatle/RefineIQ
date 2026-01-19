import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b border-blue-200 bg-white/90 backdrop-blur-md">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/Indian_Oil_Logo.svg.png"
            alt="Indian Oil Corporation Limited"
            className="h-9 w-auto object-contain"
          />
          <div>
            <p className="text-xs text-slate-500">Indian Oil Corporation Limited</p>
            <h1 className="text-lg font-semibold text-[#003A8F]">RefineryIQ</h1>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <span className="text-xs px-3 py-1 rounded-full border border-blue-100 bg-white/70 backdrop-blur-sm text-brand-blue">
              {user.role}
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleToggle}
            className="text-xs px-3 py-2 rounded-md border border-blue-100 bg-white/70 backdrop-blur-sm text-slate-700"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          {isAuthenticated ? (
            <Link
              to={user?.role === "ADMIN" ? "/dashboard/admin/profile" : "/dashboard/operator/profile"}
              className="w-9 h-9 rounded-full border border-blue-100 bg-white/70 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-brand-blue"
              aria-label="Profile"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Link>
          ) : null}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-xs px-3 py-2 rounded-md border border-blue-100 bg-white/70 backdrop-blur-sm text-slate-700"
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
