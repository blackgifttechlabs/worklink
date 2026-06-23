import React, { useRef, useEffect, useState } from 'react';

interface Category {
  name: string;
  img: string;
}

interface CategoryRailProps {
  categories: Category[];
  onSelect?: (name: string) => void;
}

export function CategoryRail({ categories, onSelect }: CategoryRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 0.05; // pixels per ms
    let currentScroll = 0;

    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollRef.current && innerRef.current && !isHovered) {
        currentScroll += speed * delta;
        
        // Use offsetWidth of the first block as the reset point
        if (currentScroll >= innerRef.current.offsetWidth) {
          currentScroll -= innerRef.current.offsetWidth;
        }
        
        scrollRef.current.scrollLeft = currentScroll;
      } else if (scrollRef.current && innerRef.current) {
        // If hovered or scrolled manually, update currentScroll to match actual scrollLeft
        currentScroll = scrollRef.current.scrollLeft;
        
        // Handle manual scrolling wrapping
        if (scrollRef.current.scrollLeft >= innerRef.current.offsetWidth) {
          scrollRef.current.scrollLeft -= innerRef.current.offsetWidth;
          currentScroll = scrollRef.current.scrollLeft;
        } else if (scrollRef.current.scrollLeft <= 0) {
           scrollRef.current.scrollLeft += innerRef.current.offsetWidth;
           currentScroll = scrollRef.current.scrollLeft;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div 
      className="w-full bg-transparent z-20 group/rail relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Desktop Arrows */}
      <button 
        onClick={scrollLeft}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-white rounded-full shadow-md border border-gray-100 z-30 opacity-0 group-hover/rail:opacity-100 transition-opacity text-gray-800 hover:bg-gray-50"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
      </button>

      <button 
        onClick={scrollRight}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-white rounded-full shadow-md border border-gray-100 z-30 opacity-0 group-hover/rail:opacity-100 transition-opacity text-gray-800 hover:bg-gray-50"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
      </button>

      {/* Mist effect left/right */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f6f7f9] to-transparent z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f6f7f9] to-transparent z-20 pointer-events-none"></div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar w-full touch-pan-x h-14 items-center"
        style={{ scrollBehavior: 'auto' }}
      >
        <div ref={innerRef} className="flex gap-6 px-4 items-center shrink-0 w-max">
           {categories.map((cat, i) => (
             <button key={i} onClick={() => onSelect?.(cat.name)} className="flex items-center gap-2 group/item transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center p-[2px] border border-gray-200 group-hover/item:border-brand-orange group-hover/item:shadow-sm shrink-0 transition-all duration-300">
                 <img 
                   src={cat.img} 
                   alt={cat.name} 
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full rounded-full object-cover"
                 />
               </div>
               <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-brand-orange transition-colors duration-300">
                 {cat.name}
               </span>
             </button>
           ))}
        </div>
        <div className="flex gap-6 px-4 items-center shrink-0 w-max">
           {categories.map((cat, i) => (
             <button key={`dup1-${i}`} onClick={() => onSelect?.(cat.name)} className="flex items-center gap-2 group/item transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center p-[2px] border border-gray-200 group-hover/item:border-brand-orange group-hover/item:shadow-sm shrink-0 transition-all duration-300">
                 <img 
                   src={cat.img} 
                   alt={cat.name} 
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full rounded-full object-cover"
                 />
               </div>
               <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-brand-orange transition-colors duration-300">
                 {cat.name}
               </span>
             </button>
           ))}
        </div>
        <div className="flex gap-6 px-4 items-center shrink-0 w-max pr-6">
           {categories.map((cat, i) => (
             <button key={`dup2-${i}`} onClick={() => onSelect?.(cat.name)} className="flex items-center gap-2 group/item transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center p-[2px] border border-gray-200 group-hover/item:border-brand-orange group-hover/item:shadow-sm shrink-0 transition-all duration-300">
                 <img 
                   src={cat.img} 
                   alt={cat.name} 
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full rounded-full object-cover"
                 />
               </div>
               <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-brand-orange transition-colors duration-300">
                 {cat.name}
               </span>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
