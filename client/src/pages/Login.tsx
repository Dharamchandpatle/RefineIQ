/**
 * Login Page
 * Authentication entry point with animated UI
 */

import BackgroundComponent from "@/components/ui/background-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    Brain,
    Loader2,
    Lock,
    Mail,
    Shield,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track energy consumption across all units",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Intelligent predictions and recommendations",
    },
    {
      icon: Shield,
      title: "Safety Intelligence",
      description: "Proactive anomaly detection and alerts",
    },
  ];

  return (
    <BackgroundComponent>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="relative"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
              </motion.div>
              <div>
                <h1 className="font-orbitron font-bold text-3xl text-gradient-primary">
                  RefineryIQ
                </h1>
                <p className="text-muted-foreground">
                  Smart Refinery Intelligence
                </p>
              </div>
            </div>

            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4">
              AI-Driven Energy & Safety Intelligence Platform
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Monitor, predict, and optimize refinery operations with
              cutting-edge AI technology.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md glass-card p-8">
              <div className="text-center mb-8">
                <h2 className="font-orbitron font-bold text-2xl mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@refineryiq.com"
                      className="pl-10 bg-muted/50 border-white/10 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-muted/50 border-white/10 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-white/5">
                <p className="text-xs text-muted-foreground mb-2">
                  Demo Credentials:
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-muted-foreground">Admin:</span>{" "}
                    <code className="text-primary">admin@refineryiq.com</code> /{" "}
                    <code className="text-primary">admin123</code>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Operator:</span>{" "}
                    <code className="text-primary">operator@refineryiq.com</code> /{" "}
                    <code className="text-primary">operator123</code>
                  </p>
                </div>
              </div>

              {/* Powered by indicator */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  Powered by RefineryIQ Intelligence Engine
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </BackgroundComponent>
  );
};

export default Login;
