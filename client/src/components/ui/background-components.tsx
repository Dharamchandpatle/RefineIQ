import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ReactNode } from "react";

interface BackgroundComponentProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Background Component with Soft Yellow Glow
 * Simple, clean background with theme support
 */
export const BackgroundComponent = ({
  children,
  className,
}: BackgroundComponentProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "min-h-screen w-full relative transition-colors duration-300",
        isDark ? "bg-background" : "bg-white",
        className
      )}
    >
      {/* Soft Yellow Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #FFF991 0%, transparent 70%)
          `,
          opacity: isDark ? 0.3 : 0.6,
          mixBlendMode: isDark ? "normal" : "multiply",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundComponent;

