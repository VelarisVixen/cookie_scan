import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

export function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.div 
      className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-card/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Sun className={`h-4 w-4 transition-colors ${isDark ? 'text-muted-foreground' : 'text-yellow-500'}`} />
      <Switch checked={isDark} onCheckedChange={onToggle} />
      <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-purple-400' : 'text-muted-foreground'}`} />
    </motion.div>
  );
}