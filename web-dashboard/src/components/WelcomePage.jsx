import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Radar, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WelcomePage({ onGetStarted }) {
  return (
    <>
      <Helmet>
        <title>Attribution Guard - Cybersecurity Protection</title>
        <meta name="description" content="Advanced cybersecurity tool that protects your affiliate ecosystem from fraud and cookie stuffing attacks." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-24 h-24 border border-secondary/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 left-10 w-16 h-16 border border-primary/20 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center space-y-8 max-w-4xl mx-auto relative z-10"
        >
          {/* Main Shield Icon with Animation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-6 rounded-full shield-pulse">
                <Shield className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
          </motion.div>

          {/* Title and Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
              🛡️ Attribution Guard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A cybersecurity tool that protects your affiliate ecosystem from fraud and cookie stuffing attacks
            </p>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            className="flex justify-center gap-8 my-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              className="flex flex-col items-center gap-2 p-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-destructive/20 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Threat Detection</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center gap-2 p-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-primary/20 p-3 rounded-full radar-sweep">
                <Radar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Real-time Scanning</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center gap-2 p-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-green-500/20 p-3 rounded-full">
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Secure Analysis</span>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-2xl pulse-glow group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            className="text-sm text-muted-foreground mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Advanced AI-powered protection against affiliate fraud • Real-time threat analysis • Comprehensive reporting
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}