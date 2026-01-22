/**
 * Header Component
 * Sticky navigation header with logo, links, and theme toggle
 */

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full border-b border-blue-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/Indian_Oil_Logo.svg.png"
            alt="Indian Oil Corporation Limited"
            className="h-10 w-auto object-contain"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs text-slate-500">Indian Oil Corporation Limited</span>
            <span className="font-orbitron font-bold text-lg text-[#003A8F]">RefineIQ</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-[#F37021]"
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-sm font-medium transition-colors hover:text-[#F37021]"
          >
            Features
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
            className="text-sm font-medium"
          >
            Login
          </Button>
        </nav>

        {/* Right Side - Theme Toggle + Login */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={() => navigate("/login")}
            variant="primary"
            size="sm"
            className="md:hidden"
          >
            Login
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
