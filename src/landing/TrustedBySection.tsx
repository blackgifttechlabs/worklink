import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

const columns = [
  {
    id: 1,
    className: 'hidden lg:flex',
    items: [
      { id: '1a', type: 'empty', top: '-5%', height: '15%' },
      { id: '1b', type: 'img', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80', top: '18%', height: '25%' },
      { id: '1c', type: 'img', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80', top: '50%', height: '28%' },
    ]
  },
  {
    id: 2,
    className: 'hidden md:flex',
    items: [
      { id: '2a', type: 'empty', top: '5%', height: '15%' },
      { id: '2b', type: 'img', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80', top: '26%', height: '24%' },
      { id: '2c', type: 'img', src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=faces&q=80', top: '58%', height: '22%' },
    ]
  },
  {
    id: 3,
    className: 'flex',
    items: [
      { id: '3a', type: 'empty', top: '0%', height: '12%' },
      { id: '3b', type: 'img', src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces&q=80', top: '18%', height: '30%' },
    ]
  },
  {
    id: 4,
    className: 'flex',
    items: [
      { id: '4a', type: 'empty', top: '12%', height: '15%' },
      { id: '4b', type: 'img', src: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces&q=80', top: '34%', height: '24%' },
    ]
  },
  {
    id: 5,
    className: 'flex',
    items: [
      { id: '5a', type: 'empty', top: '-5%', height: '20%' },
      { id: '5b', type: 'img', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&q=80', top: '22%', height: '26%' },
    ]
  },
  {
    id: 6,
    className: 'flex',
    items: [
      { id: '6a', type: 'empty', top: '5%', height: '16%' },
      { id: '6b', type: 'img', src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces&q=80', top: '26%', height: '22%' },
      { id: '6c', type: 'img', src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=faces&q=80', top: '58%', height: '28%' },
    ]
  },
  {
    id: 7,
    className: 'hidden md:flex',
    items: [
      { id: '7a', type: 'empty', top: '0%', height: '14%' },
      { id: '7b', type: 'img', src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=faces&q=80', top: '20%', height: '29%' },
      { id: '7c', type: 'img', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces&q=80', top: '56%', height: '24%' },
    ]
  },
  {
    id: 8,
    className: 'hidden lg:flex',
    items: [
      { id: '8a', type: 'empty', top: '10%', height: '15%' },
      { id: '8b', type: 'img', src: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&h=150&fit=crop&crop=faces&q=80', top: '35%', height: '26%' },
    ]
  }
];

export function TrustedBySection() {
  return (
    <section className="w-full bg-[#f8fbff] py-16 px-4 md:px-8 font-sans">
      <div className="max-w-[1240px] mx-auto bg-white rounded-[32px] md:rounded-[48px] shadow-[0_12px_48px_rgba(0,0,0,0.06)] overflow-hidden relative">
        
        {/* Cascade Images Grid */}
        <div className="h-[380px] md:h-[500px] w-full relative flex z-0 overflow-hidden px-4 md:px-12 pt-8">
          
          {columns.map((col, i) => (
            <div key={col.id} className={`flex-1 relative h-full ${col.className} flex-col items-center justify-start`}>
               {/* Vertical faint dash line */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] border-l-[1.5px] border-dashed border-gray-200/70 -z-10" />
              
              {col.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  style={{ top: item.top, height: item.height }}
                  className={`absolute w-[80%] max-w-[130px] rounded-[16px] md:rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${item.type === 'empty' ? 'bg-gray-50/50 backdrop-blur-sm' : 'bg-white z-10'}`}
                >
                  {item.type === 'img' && (
                    <img src={item.src} alt="Trusted User" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </motion.div>
              ))}
            </div>
          ))}

          {/* Fade out bottom overlay for images going down */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white to-transparent z-10" />
        </div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative z-20 flex flex-col items-center text-center pb-16 md:pb-24 px-6 bg-white shrink-0 -mt-8"
        >
          <div className="bg-gray-100 text-gray-800 text-[13px] md:text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Testimonials
          </div>
          
          <h2 className="text-[36px] sm:text-4xl md:text-5xl lg:text-[64px] font-bold text-gray-900 leading-[1.05] mb-5 tracking-tight font-sans">
            Trusted by leaders <br className="hidden md:block"/>
            <span className="text-gray-400">from various industries</span>
          </h2>
          
          <p className="text-gray-500 font-medium text-[16px] md:text-[20px] max-w-[640px] mb-10 leading-relaxed font-sans">
            Learn why professionals trust our solutions to complete their customer journeys securely and effectively.
          </p>
          
          <div>
            <Button onClick={() => window.location.assign(`${appUrl}/home`)} className="bg-black hover:bg-gray-900 text-white rounded-full px-8 h-[52px] md:h-14 font-semibold text-[15px] md:text-[16px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
              Read Success Stories
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
