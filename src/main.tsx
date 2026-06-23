import { createRoot } from 'react-dom/client';
import './styles.css';
import { LandingPage } from './landing/LandingPage';
import { InfoPage } from './landing/InfoPages';
import { HowItWorksPage } from './landing/HowItWorksPage';

const infoPages = ['about', 'contact', 'privacy', 'terms'] as const;
const page = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');

const root = document.getElementById('root')!;

if (page === 'how-it-works') {
  createRoot(root).render(<HowItWorksPage />);
} else if (infoPages.includes(page as typeof infoPages[number])) {
  createRoot(root).render(<InfoPage page={page as typeof infoPages[number]} />);
} else {
  createRoot(root).render(<LandingPage />);
}
