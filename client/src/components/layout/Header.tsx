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
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* IOCL Logo */}
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFPC-soVqmkNILA6QUDqpv9ZRMbkunkW6TRw&s"
            alt="IOCL Logo"
            className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
          />
          <span className="font-orbitron font-bold text-lg hidden sm:inline-block">
            RefineIQ
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-sm font-medium transition-colors hover:text-primary"
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
