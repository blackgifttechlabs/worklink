import { createRoot } from 'react-dom/client';
import './styles.css';
import { LandingPage } from './landing/LandingPage';
import { InfoPage } from './landing/InfoPages';

const pages = ['how-it-works', 'about', 'contact', 'privacy', 'terms'] as const;
const page = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(pages.includes(page as typeof pages[number]) ? <InfoPage page={page as typeof pages[number]} /> : <LandingPage />);
