import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import './styles.css';
import { LandingPage } from './landing/LandingPage';
import { InfoPage } from './landing/InfoPages';
import { HowItWorksPage } from './landing/HowItWorksPage';
import { AboutPage } from './landing/AboutPage';
import { ContactPage } from './landing/ContactPage';

const legalPages = ['privacy', 'terms'] as const;
const page = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');

const root = document.getElementById('root')!;

function App() {
  const renderContent = () => {
    if (page === 'how-it-works') {
      return <HowItWorksPage />;
    } else if (page === 'about') {
      return <AboutPage />;
    } else if (page === 'contact') {
      return <ContactPage />;
    } else if (legalPages.includes(page as typeof legalPages[number])) {
      return <InfoPage page={page as typeof legalPages[number]} />;
    } else {
      return <LandingPage />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(root).render(<App />);
