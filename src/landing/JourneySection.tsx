import { motion } from 'motion/react';

type CardFooterItemProps = {
  key?: string | number;
  icon: string;
  label: string;
  colorClass: string;
};

const CardFooterItem = ({ icon, label, colorClass }: CardFooterItemProps) => (
  <span className="flex items-center gap-1">
    <span className={`material-symbols-outlined text-[16px] ${colorClass}`}>{icon}</span>
    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
  </span>
);

export function JourneySection() {
  return (
    <section className="w-full relative py-20 px-4 md:px-8 font-sans overflow-hidden bg-gradient-to-br from-pink-50/40 via-white to-purple-50/60">
      {/* Background blobs for the gradient aesthetic */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-pink-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 select-none"
        >
          <p className="text-[13px] md:text-sm font-bold tracking-[0.2em] text-fuchsia-600 uppercase mb-4 inline-block bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full">
            Explore Everything
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-[#111827] leading-tight mb-4 tracking-tight">
            Your Journey, Simplified
          </h2>
          <p className="text-gray-500 text-[17px] md:text-lg max-w-[600px] mx-auto font-medium">
            Find what you need. Connect with what matters.
          </p>
        </motion.div>

        {/* Mobile View: Stacked Layout */}
        <div className="flex flex-col gap-6 lg:hidden max-w-[400px] mx-auto">
          <JourneyCard 
            step="1" title="Search" description="Find jobs, skills and matches that fit you."
            image="https://i.postimg.cc/VShvgmvD/animalsandcare.avif"
            color="pink" icon="search"
            footer={[{icon: 'work', label: 'Jobs'}, {icon: 'visibility', label: 'Skills'}, {icon: 'check', label: 'Matches'}]}
          />
          <DownConnector />
          <JourneyCard 
            step="2" title="Jobs" description="Discover nearby opportunities that match your skills."
            image="https://i.postimg.cc/LqW5D258/farmer-converted.avif"
            color="green" icon="work"
            footer={[{icon: 'location_on', label: 'Nearby'}, {icon: 'visibility', label: 'Open'}, {icon: 'check', label: 'Ready'}]}
          />
          <DownConnector />
          <JourneyCard 
             step="3" title="Workers" description="View profiles, reviews and find the right fit."
             image="https://i.postimg.cc/8s6JyJhV/profileimg.avif"
             color="purple" icon="group"
             footer={[{icon: 'person', label: 'Profiles'}, {icon: 'visibility', label: 'Reviews'}, {icon: 'check', label: 'Fit'}]}
          />
          <DownConnector />
          <JourneyCard 
             step="4" title="Products" description="Browse items and buy from trusted sellers."
             image="https://i.postimg.cc/4K0yPsyN/finance-converted.avif"
             color="orange" icon="storefront"
             footer={[{icon: 'person', label: 'Sellers'}, {icon: 'visibility', label: 'Items'}, {icon: 'check', label: 'Buy'}]}
          />
          <DownConnector />
          <JourneyCard 
             step="5" title="Connect" description="Chat, agree and get things done easily."
             image="https://i.postimg.cc/rdHsjMsp/events-converted.avif"
             color="fuchsia" icon="chat"
             footer={[{icon: 'chat', label: 'Chat'}, {icon: 'visibility', label: 'Agree'}, {icon: 'check', label: 'Done'}]}
          />
        </div>

        {/* Desktop View: Linear Flow Layout */}
        <div className="hidden lg:flex flex-row justify-between items-center gap-4 xl:gap-8 relative w-full max-w-[1300px] mx-auto h-[460px]">
          
          <div className="flex-1 max-w-[240px] relative z-10">
            <JourneyCard 
              step="1" title="Search" description="Find matches that fit you."
              image="https://i.postimg.cc/VShvgmvD/animalsandcare.avif"
              color="pink" icon="search"
              footer={[{icon: 'work', label: 'Jobs'}, {icon: 'visibility', label: 'Skills'}, {icon: 'check', label: 'Matches'}]}
            />
            {/* Connector 1 -> 2 */}
            <RightConnector />
          </div>

          <div className="flex-1 max-w-[240px] relative z-10">
            <JourneyCard 
              step="2" title="Jobs" description="Discover nearby opportunities."
              image="https://i.postimg.cc/LqW5D258/farmer-converted.avif"
              color="green" icon="work"
              footer={[{icon: 'location_on', label: 'Nearby'}, {icon: 'visibility', label: 'Open'}, {icon: 'check', label: 'Ready'}]}
            />
            {/* Connector 2 -> 3 */}
            <RightConnector />
          </div>

          <div className="flex-1 max-w-[240px] relative z-20">
            <JourneyCard 
              step="3" title="Workers" description="View profiles and find the fit."
              image="https://i.postimg.cc/8s6JyJhV/profileimg.avif"
              color="purple" icon="group"
              footer={[{icon: 'person', label: 'Profiles'}, {icon: 'visibility', label: 'Reviews'}, {icon: 'check', label: 'Fit'}]}
            />
             {/* Connector 3 -> 4 */}
            <RightConnector />
          </div>

          <div className="flex-1 max-w-[240px] relative z-10">
            <JourneyCard 
              step="4" title="Products" description="Buy from trusted sellers."
              image="https://i.postimg.cc/4K0yPsyN/finance-converted.avif"
              color="orange" icon="storefront"
              footer={[{icon: 'person', label: 'Sellers'}, {icon: 'visibility', label: 'Items'}, {icon: 'check', label: 'Buy'}]}
            />
            {/* Connector 4 -> 5 */}
            <RightConnector />
          </div>

          <div className="flex-1 max-w-[240px] relative z-10">
            <JourneyCard 
              step="5" title="Connect" description="Chat, agree and get things done."
              image="https://i.postimg.cc/rdHsjMsp/events-converted.avif"
              color="fuchsia" icon="chat"
              footer={[{icon: 'chat', label: 'Chat'}, {icon: 'visibility', label: 'Agree'}, {icon: 'check', label: 'Done'}]}
            />
          </div>
        </div>

        {/* Bottom Features Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl py-6 px-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
        >
          <FeatureItem icon="shield" title="Smart & Secure" description="Your safety is our priority" iconColor="text-purple-600" />
          <div className="hidden md:block w-px h-10 bg-gray-200" />
          <FeatureItem icon="schedule" title="Save Time" description="Everything in one place" iconColor="text-indigo-600" />
          <div className="hidden md:block w-px h-10 bg-gray-200" />
          <FeatureItem icon="star" title="Trusted Community" description="Real people, real results" iconColor="text-orange-500" />
          <div className="hidden md:block w-px h-10 bg-gray-200" />
          <FeatureItem icon="favorite" title="Always Here" description="Support that cares" iconColor="text-pink-500" />
        </motion.div>

      </div>
    </section>
  );
}

const colors = {
  pink: {
    bg: 'from-pink-500/80 to-rose-600/80',
    blob: 'bg-rose-500',
    title: 'text-rose-600',
    iconBg: 'bg-white text-rose-500',
    footerIcon: 'text-rose-500',
    border: 'border-rose-100',
  },
  green: {
    bg: 'from-green-400/80 to-emerald-600/80',
    blob: 'bg-emerald-500',
    title: 'text-emerald-600',
    iconBg: 'bg-white text-emerald-500',
    footerIcon: 'text-emerald-500',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'from-purple-500/80 to-indigo-600/80',
    blob: 'bg-indigo-500',
    title: 'text-indigo-600',
    iconBg: 'bg-white text-indigo-500',
    footerIcon: 'text-indigo-500',
    border: 'border-indigo-100',
  },
  orange: {
    bg: 'from-orange-400/80 to-amber-600/80',
    blob: 'bg-orange-500',
    title: 'text-orange-600',
    iconBg: 'bg-white text-orange-500',
    footerIcon: 'text-orange-500',
    border: 'border-orange-100',
  },
  fuchsia: {
    bg: 'from-fuchsia-400/80 to-pink-600/80',
    blob: 'bg-pink-500',
    title: 'text-pink-600',
    iconBg: 'bg-white text-pink-500',
    footerIcon: 'text-pink-500',
    border: 'border-pink-100',
  }
};

type JourneyCardProps = {
  step: string;
  title: string;
  description: string;
  image: string;
  color: keyof typeof colors;
  icon: string;
  footer: { icon: string; label: string }[];
};

function JourneyCard({ step, title, description, image, color, icon, footer }: JourneyCardProps) {
  const theme = colors[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white rounded-[26px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-visible group hover:-translate-y-1 transition-transform duration-300 w-full relative z-10 flex flex-col"
    >
      <div className={`relative h-[150px] w-full rounded-t-[26px] overflow-hidden`}>
        {/* Colorful Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${theme.bg} mix-blend-multiply z-10 opacity-90`} />
        
        {/* Background Image */}
        <img src={image} alt={title} className="w-full h-full object-cover grayscale opacity-90" />
        
        {/* Top Left Step Badge */}
        <div className={`absolute top-4 left-4 ${theme.blob} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-20`}>
          {step}
        </div>
        
        {/* Top Right Icon Badge */}
        <div className={`absolute top-4 right-4 ${theme.iconBg} w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-20`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        
        {/* Subtle curved bottom shape using SVG mask or clip-path for that organic feel */}
        <div className="absolute -bottom-4 left-0 right-0 h-10 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }} />
      </div>

      <div className="px-6 pt-5 pb-6 flex-1 bg-white">
        <h3 className={`text-xl font-bold mb-2 ${theme.title}`}>{title}</h3>
        <p className="text-gray-500 text-[14px] leading-relaxed font-medium">{description}</p>
      </div>

      <div className={`px-5 py-4 flex items-center justify-between text-[11px] font-bold text-gray-400 bg-gray-50/50 rounded-b-[26px] uppercase tracking-wider`}>
        {footer.map((item, i) => (
          <CardFooterItem key={i} icon={item.icon} label={item.label} colorClass={theme.footerIcon} />
        ))}
      </div>
    </motion.div>
  );
}

function RightConnector() {
  return (
    <div className="absolute -right-[30px] xl:-right-[40px] top-1/2 w-[30px] xl:w-[40px] flex items-center justify-end -mt-4">
      <div className="flex-1 h-[3px] overflow-hidden translate-y-[2px]">
        <svg width="100%" height="3" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="1.5" x2="100%" y2="1.5" stroke="#9ca3af" strokeWidth="3" strokeDasharray="6 6">
            <animate attributeName="stroke-dashoffset" values="12;0" dur="1s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>
      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-gray-400 -ml-1 translate-y-[2px]" />
    </div>
  );
}

function DownConnector() {
  return (
    <div className="flex justify-center -my-2 h-8 relative z-0">
      <div className="w-[3px] h-[32px] overflow-hidden">
        <svg width="3" height="32" xmlns="http://www.w3.org/2000/svg">
          <line x1="1.5" y1="0" x2="1.5" y2="32" stroke="#d1d5db" strokeWidth="3" strokeDasharray="6 6">
             <animate attributeName="stroke-dashoffset" values="12;0" dur="1s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>
      <div className="absolute bottom-0 w-0 h-0 border-t-[6px] border-t-gray-400 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent translate-y-1" />
    </div>
  );
}

function FeatureItem({ icon, title, description, iconColor }: { icon: string; title: string; description: string; iconColor: string }) {
  return (
    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className={`w-12 h-12 rounded-full ${iconColor.replace('text-', 'bg-').replace('-500', '-100').replace('-600', '-100')} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm border-gray-800">{title}</h4>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
