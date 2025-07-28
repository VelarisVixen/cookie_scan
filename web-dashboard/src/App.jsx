
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomePage } from '@/components/WelcomePage';
import { UploadPage } from '@/components/UploadPage';
import { ResultsPage } from '@/components/ResultsPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [scannedUrls, setScannedUrls] = useState([]);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Apply theme class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleGetStarted = () => {
    setCurrentPage('upload');
  };

  const handleStartScan = (urls) => {
    setScannedUrls(urls);
    setCurrentPage('results');
  };

  const handleBackToUpload = () => {
    setCurrentPage('upload');
  };

  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <ThemeToggle isDark={isDark} onToggle={setIsDark} />
      
      <AnimatePresence mode="wait">
        {currentPage === 'welcome' && (
          <motion.div
            key="welcome"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <WelcomePage onGetStarted={handleGetStarted} />
          </motion.div>
        )}
        
        {currentPage === 'upload' && (
          <motion.div
            key="upload"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <UploadPage 
              onBack={handleBackToWelcome}
              onStartScan={handleStartScan}
            />
          </motion.div>
        )}
        
        {currentPage === 'results' && (
          <motion.div
            key="results"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ResultsPage 
              onBack={handleBackToUpload}
              scannedUrls={scannedUrls}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Toaster />
    </div>
  );
}

export default App;
