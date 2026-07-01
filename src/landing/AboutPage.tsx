import { motion, useReducedMotion } from 'motion/react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { TrustedBySection } from './TrustedBySection';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

const pillars = [
  {
    icon: 'location_on',
    title: 'Built locally',
    description:
      'Service Loop is designed around how people find work and services across Zimbabwe — from Harare to Bulawayo and every province in between.',
    accent: 'from-rose-500/80 to-orange-500/80',
    badge: 'bg-rose-500',
    image: 'https://i.postimg.cc/bZzZNm4s/c3.jpg',
  },
  {
    icon: 'verified_user',
    title: 'Built for trust',
    description:
      'Clear profiles, service details, and direct conversations help clients and providers make informed choices before work begins.',
    accent: 'from-indigo-500/80 to-purple-600/80',
    badge: 'bg-indigo-500',
    image: 'https://i.postimg.cc/8s6JyJhV/profileimg.avif',
  },
  {
    icon: 'trending_up',
    title: 'Built to grow',
    description:
      'We are evolving with the needs of local providers, clients, and communities — adding features that make everyday work easier over time.',
    accent: 'from-emerald-500/80 to-teal-600/80',
    badge: 'bg-emerald-500',
    image: 'https://i.postimg.cc/LqW5D258/farmer-converted.avif',
  },
] as const;

const stats = [
  { value: '10+', label: 'Service categories' },
  { value: 'All', label: 'Provinces covered' },
  { value: '1', label: 'Connected marketplace' },
  { value: '24/7', label: 'Discovery access' },
] as const;

const values = [
  { icon: 'groups', title: 'Community first', text: 'Real people, real skills, real local connections.' },
  { icon: 'handshake', title: 'Direct relationships', text: 'Clients and providers talk directly — no unnecessary barriers.' },
  { icon: 'visibility', title: 'Clear information', text: 'Profiles and services you can actually understand before you commit.' },
  { icon: 'rocket_launch', title: 'Always improving', text: 'We ship thoughtfully and listen to feedback from the people who use Service Loop.' },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#1a232c] px-5 pb-24 pt-16 text-white md:px-8 md:pb-32 md:pt-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#fb7152]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <motion.p
            variants={itemVariants}
            className="mb-5 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[12px] font-black tracking-[0.2em] text-[#fb7152]"
          >
            ABOUT SERVICE LOOP
          </motion.p>
          <motion.h1 variants={itemVariants} className="text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            A clearer local marketplace for Zimbabwe.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-gray-300 md:text-lg"
          >
            Service Loop brings clients, providers, jobs, and local services into one connected place — making everyday
            work easier to find, understand, and complete.
          </motion.p>
        </motion.div>
      </section>

      <section className="relative -mt-10 bg-[#f8f9fb] px-5 py-16 md:px-8 md:py-20">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true }}
          variants={containerVariants}
          className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white px-5 py-6 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-[#fb7152] md:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="mx-auto max-w-5xl"
        >
          <motion.div variants={itemVariants} className="mb-14 text-center">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#fb7152]">Our foundation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">What we stand for</h2>
          </motion.div>

          <div className="space-y-8">
            {pillars.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                custom={index * 0.1}
                initial={reduceMotion ? false : 'hidden'}
                whileInView={reduceMotion ? undefined : 'visible'}
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
              >
                <div
                  className={`grid items-center gap-0 md:grid-cols-2 ${index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="relative h-56 md:h-full md:min-h-[280px]">
                    <img src={pillar.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${pillar.accent} mix-blend-multiply opacity-80`} />
                    <div
                      className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full ${pillar.badge} shadow-lg`}
                    >
                      <span className="material-symbols-outlined text-[22px] text-white">{pillar.icon}</span>
                    </div>
                  </div>
                  <div className="p-8 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900">{pillar.title}</h3>
                    <p className="mt-4 leading-relaxed text-gray-600">{pillar.description}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-[#f8f9fb] px-5 py-20 md:px-8 md:py-28">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true }}
          variants={containerVariants}
          className="mx-auto max-w-5xl"
        >
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#fb7152]">Our values</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Principles that guide every decision
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="rounded-[24px] border border-gray-100 bg-white p-7 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fb7152]/10">
                  <span className="material-symbols-outlined text-[22px] text-[#fb7152]">{value.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <TrustedBySection />
      </motion.div>

      <section className="relative overflow-hidden bg-[#1a232c] px-5 py-20 text-center text-white md:px-8 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fb7152]/10 via-transparent to-indigo-500/10" />
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true }}
          variants={containerVariants}
          className="relative z-10 mx-auto max-w-2xl"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight md:text-4xl">
            Join the marketplace
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-gray-300">
            Whether you need help or offer a service, Service Loop is built for you.
          </motion.p>
          <motion.div variants={itemVariants} className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
            <Button
              onClick={() => window.location.assign(`${appUrl}/home`)}
              className="h-14 w-full border-none px-8 text-[16px] shadow-lg sm:w-auto"
            >
              Enter Service Loop
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.assign('/how-it-works')}
              className="h-14 w-full border-white/25 px-8 text-[16px] sm:w-auto"
            >
              See how it works
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
