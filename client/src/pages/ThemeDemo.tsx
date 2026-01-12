/**
 * Background Demo Component
 * Shows the background effects in action
 */

import BackgroundComponent from "@/components/ui/background-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

export default function BackgroundDemo() {
  const { theme } = useTheme();

  return (
    <BackgroundComponent>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Theme Toggle Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Theme Demo - RefineryIQ</span>
                <ThemeToggle />
              </CardTitle>
              <CardDescription>
                Current theme: <strong className="capitalize">{theme}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Features:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Click the sun/moon icon to toggle themes</li>
                  <li>Smooth transitions between light and dark modes</li>
                  <li>Background automatically adapts to theme</li>
                  <li>Preference saved in localStorage</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Dark Mode</h4>
                  <p className="text-xs text-muted-foreground">
                    Industrial aesthetic with neon glows and deep navy background
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <h4 className="font-semibold text-secondary mb-2">Light Mode</h4>
                  <p className="text-xs text-muted-foreground">
                    Clean white background with soft yellow radial glow
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  The background component uses <code className="px-1 py-0.5 rounded bg-muted">next-themes</code> to detect the current theme and applies appropriate styling automatically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Color Palette Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                    Primary
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium">
                    Secondary
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs font-medium">
                    Accent
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-success flex items-center justify-center text-success-foreground text-xs font-medium">
                    Success
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-warning flex items-center justify-center text-warning-foreground text-xs font-medium">
                    Warning
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-destructive flex items-center justify-center text-destructive-foreground text-xs font-medium">
                    Destructive
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BackgroundComponent>
  );
}
