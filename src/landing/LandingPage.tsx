import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { CategoryRail } from "./CategoryRail";
import { MarketplaceConversation } from "./MarketplaceConversation";
import { TrustedBySection } from "./TrustedBySection";
import { JourneySection } from "./JourneySection";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

export function LandingPage() {
  const crests = [
    "https://i.postimg.cc/hXSXP2Nr/c1.png",
    "https://i.postimg.cc/fVwVT810/c2.png",
    "https://i.postimg.cc/bZzZNm4s/c3.jpg",
    "https://i.postimg.cc/FY9YsTwY/c4.jpg",
    "https://i.postimg.cc/CRFRLc9d/c5.jpg",
    "https://i.postimg.cc/0bG6sTXj/c6.jpg"
  ];

  const categories = [
    { name: "Hospitality", img: "https://i.postimg.cc/bZzZNm4s/c3.jpg" }, 
    { name: "Agriculture", img: "https://i.postimg.cc/LqW5D258/farmer-converted.avif" },
    { name: "Care & Animals", img: "https://i.postimg.cc/VShvgmvD/animalsandcare.avif" },
    { name: "Finance", img: "https://i.postimg.cc/4K0yPsyN/finance-converted.avif" },
    { name: "Legal & Admin", img: "https://i.postimg.cc/8s6JyJhV/profileimg.avif" },
    { name: "Security", img: "https://i.postimg.cc/gxNnwvPN/security-converted.avif" },
    { name: "Mining", img: "https://i.postimg.cc/zLv3TVJs/mining.avif" },
    { name: "Tourism", img: "https://i.postimg.cc/rdHsjMsp/events-converted.avif" },
    { name: "Retail", img: "https://i.postimg.cc/bdtD6DQ8/cleaners-zimbabwe.webp" },
    { name: "Community", img: "https://i.postimg.cc/064jnPjd/childcare-converted.avif" },
    { name: "Automotive", img: "https://i.postimg.cc/gw7jsmjg/automech-converted.avif" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col font-sans">
      <SiteHeader />
      
      {/* Hero Section Container */}
      <div id="top" className="flex flex-col min-h-[calc(100vh-76px)] bg-[#1a232c] overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        ></div>

        <div className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 flex items-center pt-10 pb-28 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
            
            {/* Left Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex flex-col items-center text-center lg:items-start lg:text-left text-white w-full lg:max-w-2xl pt-4 lg:pt-0"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-2 pr-4 py-1.5 mb-6 text-sm">
                <span className="material-symbols-outlined text-gray-300" style={{ fontSize: '16px' }}>location_on</span>
                <span className="text-gray-200">Built for Zimbabwe's work market</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-[40px] leading-[1.1] sm:text-6xl lg:text-[72px] font-bold tracking-tight lg:leading-[1.05] text-white">
                Find the right job. <br className="hidden lg:block" />Find the right worker.
              </motion.h1>
              
              <motion.p variants={itemVariants} className="mt-6 lg:mt-8 text-[16px] sm:text-[20px] leading-relaxed text-gray-300 max-w-lg font-light">
                ServiceLoop brings verified providers, job posts, local shops, messages, wishlists, and profiles into one clear marketplace for everyday work.
              </motion.p>
              
              <motion.div variants={itemVariants} className="mt-8 lg:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                  <Button onClick={() => window.location.assign(`${appUrl}/home`)} className="w-full h-[56px] px-8 bg-[#fb7152] hover:bg-[#e86043] text-white rounded-full font-semibold text-[16px] shadow-lg flex items-center justify-center gap-2 transition-transform border-none">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      arrow_forward
                    </span>
                    Enter Service Loop
                  </Button>
                </div>
                <div className="w-full sm:w-auto">
                  <Button variant="outline" onClick={() => window.location.assign(`${appUrl}/providers`)} className="w-full h-[56px] px-8 rounded-full font-semibold text-[16px] flex items-center justify-center gap-2 border-white/30 hover:bg-white/10 text-white">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                    Explore services
                  </Button>
                </div>
              </motion.div>

              {/* Provinces Trust Section */}
              <motion.div variants={itemVariants} className="mt-12 lg:mt-16 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {crests.map((src, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-[#1a232c] shadow-sm">
                      <img src={src} alt="Province Crest" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col ml-0 sm:ml-2 items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
                  <div className="flex items-center justify-center sm:justify-start text-[#ffcc00] gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
                    ))}
                  </div>
                  <span className="text-gray-300 text-sm mt-1 sm:mt-0.5">
                    Available across <strong className="text-white font-semibold">all provinces</strong>
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="hidden lg:flex justify-end items-center right-image-container perspective-1000"
            >
              <img 
                src="https://i.postimg.cc/XpKZbRHm/hero-image.webp" 
                alt="ServiceLoop Floating Island" 
                className="w-full max-w-[800px] h-auto object-contain transform hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl translate-x-8"
              />
            </motion.div>
            
          </div>
        </div>
        
        {/* Bottom Category Ribbon */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
           className="w-full h-[65px] absolute bottom-0 left-0 right-0 z-20"
        >
          <CategoryRail categories={categories} />
        </motion.div>
      </div>
      
      {/* Marketplace Conversation Animation Section */}
      <motion.div id="how-it-works"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-30 mt-[100px] w-full bg-white pt-8 pb-16 md:pt-12 md:pb-24"
      >
        <MarketplaceConversation />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <JourneySection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <TrustedBySection />
      </motion.div>

      <Footer />
    </div>
  );
}
