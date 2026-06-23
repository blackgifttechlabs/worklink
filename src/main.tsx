import { createRoot } from 'react-dom/client';
import './styles.css';
import { LandingPage } from './landing/LandingPage';

createRoot(document.getElementById('root')!).render(<LandingPage />);
