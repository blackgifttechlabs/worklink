import { Button } from '@/components/ui/Button';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

export function SiteHeader() {
  return <header className="sticky top-0 z-50 h-[76px] border-b border-gray-100 bg-white/95 px-4 shadow-sm backdrop-blur md:px-8">
    <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-5">
      <a href="/" className="flex items-center gap-2 text-[18px] font-black tracking-tight text-[#1a232c]">
        <img src="/logo.png" alt="Service Loop" className="h-9 w-9 rounded-full" />
        Service Loop
      </a>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Landing navigation">
        <a href="/how-it-works" className="text-[14px] font-bold text-gray-600 transition-colors hover:text-[#fb7152]">How it works</a>
        <a href="/about" className="text-[14px] font-bold text-gray-600 transition-colors hover:text-[#fb7152]">About</a>
        <a href="/contact" className="text-[14px] font-bold text-gray-600 transition-colors hover:text-[#fb7152]">Contact</a>
      </nav>
      <Button onClick={() => window.location.assign(`${appUrl}/home`)} className="h-10 px-5 text-[13px]">Enter Service Loop <span className="material-symbols-outlined ml-1 text-[17px]">arrow_forward</span></Button>
    </div>
  </header>;
}
