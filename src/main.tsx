import { createRoot } from 'react-dom/client';
import './styles.css';
import { LandingPage } from './landing/LandingPage';
import { InfoPage } from './landing/InfoPages';
import { HowItWorksPage } from './landing/HowItWorksPage';
import { AboutPage } from './landing/AboutPage';
import { ContactPage } from './landing/ContactPage';

const legalPages = ['privacy', 'terms'] as const;
const page = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');

const root = document.getElementById('root')!;

if (page === 'how-it-works') {
  createRoot(root).render(<HowItWorksPage />);
} else if (page === 'about') {
  createRoot(root).render(<AboutPage />);
} else if (page === 'contact') {
  createRoot(root).render(<ContactPage />);
} else if (legalPages.includes(page as typeof legalPages[number])) {
  createRoot(root).render(<InfoPage page={page as typeof legalPages[number]} />);
} else {
  createRoot(root).render(<LandingPage />);
}
