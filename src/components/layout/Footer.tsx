import { ArrowRight, Facebook, Instagram, Music2, MessageCircle, Pin } from 'lucide-react';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

export function Footer() {
  return (
    <footer className="w-full bg-[#0D0B12] pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Top Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16 text-left">
          <div>
            <h4 className="text-[#fb7152] font-bold text-[14px] mb-6">For Clients</h4>
            <div className="flex flex-col gap-4 text-gray-400 text-[14px]">
              <a href={`${appUrl}/providers`} className="hover:text-white transition-colors">Find someone for a job</a>
              <a href={`${appUrl}/providers`} className="hover:text-white transition-colors">Browse service types</a>
              <a href={`${appUrl}/home`} className="hover:text-white transition-colors">See how hiring works</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[#fb7152] font-bold text-[14px] mb-6">For Workers</h4>
            <div className="flex flex-col gap-4 text-gray-400 text-[14px]">
              <a href={`${appUrl}/register`} className="hover:text-white transition-colors">Create your profile</a>
              <a href={`${appUrl}/providers`} className="hover:text-white transition-colors">Show your services</a>
              <a href={`${appUrl}/home`} className="hover:text-white transition-colors">Follow new features</a>
            </div>
          </div>

          <div>
            <h4 className="text-[#fb7152] font-bold text-[14px] mb-6">Popular Work</h4>
            <div className="flex flex-col gap-4 text-gray-400 text-[14px]">
              <a href={`${appUrl}/providers?q=Gardening`} className="hover:text-white transition-colors">Gardening</a>
              <a href={`${appUrl}/providers?q=Plumbing`} className="hover:text-white transition-colors">Plumbing</a>
              <a href={`${appUrl}/providers?q=Hair%20%26%20Nails`} className="hover:text-white transition-colors">Hair & Nails</a>
              <a href={`${appUrl}/providers?q=Therapy`} className="hover:text-white transition-colors">Therapy & Wellness</a>
              <a href={`${appUrl}/providers?q=Programming`} className="hover:text-white transition-colors">Programming & Design</a>
            </div>
          </div>

          <div>
            <h4 className="text-[#fb7152] font-bold text-[14px] mb-6">Zimbabwe Focus</h4>
            <div className="flex flex-col gap-4 text-gray-400 text-[14px]">
              <a href={`${appUrl}/providers?q=Harare`} className="hover:text-white transition-colors">Harare</a>
              <a href={`${appUrl}/providers?q=Bulawayo`} className="hover:text-white transition-colors">Bulawayo</a>
              <a href={`${appUrl}/providers?q=Mutare`} className="hover:text-white transition-colors">Mutare</a>
              <a href={`${appUrl}/providers?q=Gweru`} className="hover:text-white transition-colors">Gweru</a>
              <a href={`${appUrl}/providers?q=Chitungwiza`} className="hover:text-white transition-colors">Chitungwiza</a>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold text-[14px] mb-6">Follow the Build</h4>
            <p className="text-gray-400 text-[13px] leading-relaxed mb-6">
              ServiceLoop starts with profiles and discovery. Reviews, bookings, and safer payments can be added as the platform grows.
            </p>
            <div className="flex w-full mb-3">
              <input type="email" placeholder="Enter email address" className="bg-[#1a1820] text-white border-none rounded-l-lg px-4 py-3 text-[14px] w-full focus:outline-none focus:ring-1 focus:ring-[#fb7152]" />
              <button className="bg-[#fb7152] hover:bg-[#e86043] rounded-r-lg px-4 flex items-center justify-center transition-colors">
                <ArrowRight className="text-white w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 text-[11px]">
              Launch updates only. By subscribing you agree to our Privacy Policy.
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 mb-8" />

        {/* Pillars */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <div className="bg-[#fb7152]/10 border border-[#fb7152]/20 text-white px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-bold">
            <span className="material-symbols-outlined text-[#fb7152]" style={{fontSize: '18px'}}>location_on</span>
            Built for Zimbabwe
          </div>
          <div className="bg-red-500/10 border border-red-500/20 text-white px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-bold">
            <span className="material-symbols-outlined text-red-500" style={{fontSize: '18px'}}>person</span>
            Local worker profiles
          </div>
          <div className="bg-[#8c31e0]/10 border border-[#8c31e0]/20 text-white px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-bold">
            <span className="material-symbols-outlined text-[#8c31e0]" style={{fontSize: '18px'}}>work</span>
            Everyday jobs and skilled services
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-[12px]">
            <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/privacy" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Community Guidelines</a>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-black/50 border border-gray-800 transition-colors cursor-pointer text-[#e23f3f]">
               <Facebook className="w-[18px] h-[18px]" />
             </div>
             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-black/50 border border-gray-800 transition-colors cursor-pointer text-[#e23f3f]">
               <Instagram className="w-[18px] h-[18px]" />
             </div>
             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-black/50 border border-gray-800 transition-colors cursor-pointer text-[#e23f3f]">
               <Music2 className="w-[18px] h-[18px]" />
             </div>
             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-black/50 border border-gray-800 transition-colors cursor-pointer text-[#e23f3f]">
               <MessageCircle className="w-[18px] h-[18px]" />
             </div>
             <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-black/50 border border-gray-800 transition-colors cursor-pointer text-[#e23f3f]">
               <Pin className="w-[18px] h-[18px]" />
             </div>
          </div>
        </div>
        
      </div>

    </footer>
  );
}
