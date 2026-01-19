/**
 * Feature Card Component
 * Animated card for displaying platform features
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="h-full"
    >
      <Card className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 group hover:border-[#003A8F]/40 hover:shadow-md">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-[#003A8F]/10 flex items-center justify-center mb-4 group-hover:bg-[#F37021]/15 transition-colors">
            <Icon className="w-6 h-6 text-brand-blue" />
          </div>
          <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-slate-600">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
