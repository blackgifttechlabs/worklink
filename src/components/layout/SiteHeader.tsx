import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');
const navItems = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return <>
    <header className="sticky top-0 z-50 h-[76px] border-b border-gray-100 bg-white/95 px-3 shadow-sm backdrop-blur sm:px-4 md:px-8">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-3 sm:gap-5">
        <a href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[18px] font-black tracking-tight text-[#1a232c]">
          <img src="/logo.png" alt="Service Loop" className="h-9 w-9 rounded-full" />
          Service Loop
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Landing navigation">
          {navItems.map((item) => <a key={item.href} href={item.href} className="text-[14px] font-bold text-gray-600 transition-colors hover:text-[#fb7152]">{item.label}</a>)}
        </nav>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a232c] shadow-sm transition-colors hover:border-[#fb7152] hover:text-[#fb7152] md:hidden"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div className={`fixed inset-0 z-[60] bg-[#111827]/45 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setIsMenuOpen(false)} />
    <aside
      id="mobile-menu"
      className={`fixed right-0 top-0 z-[70] h-dvh w-[min(82vw,320px)] bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!isMenuOpen}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-5">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-[18px] font-black tracking-tight text-[#1a232c]" onClick={() => setIsMenuOpen(false)}>
            <img src="/logo.png" alt="Service Loop" className="h-9 w-9 rounded-full" />
            Service Loop
          </a>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1a232c] transition-colors hover:border-[#fb7152] hover:text-[#fb7152]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex flex-col px-5 py-5" aria-label="Mobile navigation">
          {navItems.map((item) => <a key={item.href} href={item.href} className="border-b border-gray-100 py-4 text-[16px] font-bold text-gray-700 transition-colors hover:text-[#fb7152]" onClick={() => setIsMenuOpen(false)}>{item.label}</a>)}
          <a href={`${appUrl}/home`} className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#fb7152] px-5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#e86043]" onClick={() => setIsMenuOpen(false)}>Enter Loop</a>
        </nav>
      </div>
    </aside>
  </>;
}
