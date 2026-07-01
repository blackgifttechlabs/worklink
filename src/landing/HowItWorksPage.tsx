import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { MarketplaceConversation } from './MarketplaceConversation';
import { JourneySection } from './JourneySection';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

const steps = [
  {
    number: '01',
    title: 'Search',
    headline: 'Find what you need locally',
    description:
      'Browse providers, services, job opportunities, and local offers across Zimbabwe. Filter by location, category, and skills to discover the right match quickly.',
    icon: 'search',
    image: 'https://i.postimg.cc/VShvgmvD/animalsandcare.avif',
    accent: 'from-rose-500/80 to-orange-500/80',
    badge: 'bg-rose-500',
    tags: ['Providers', 'Services', 'Jobs', 'Local shops'],
  },
  {
    number: '02',
    title: 'Connect',
    headline: 'Talk directly, decide confidently',
    description:
      'Open a profile, review services and experience, then start a direct conversation. No middlemen — just clear communication between clients and providers.',
    icon: 'forum',
    image: 'https://i.postimg.cc/8s6JyJhV/profileimg.avif',
    accent: 'from-indigo-500/80 to-purple-600/80',
    badge: 'bg-indigo-500',
    tags: ['Profiles', 'Reviews', 'Messages', 'Details'],
  },
  {
    number: '03',
    title: 'Get it done',
    headline: 'Agree, act, and move forward',
    description:
      'Set expectations, agree on the work, and keep the conversation going until the job is complete. Service Loop keeps everything in one place.',
    icon: 'task_alt',
    image: 'https://i.postimg.cc/rdHsjMsp/events-converted.avif',
    accent: 'from-emerald-500/80 to-teal-600/80',
    badge: 'bg-emerald-500',
    tags: ['Agree', 'Track', 'Complete', 'Repeat'],
  },
] as const;

const audiences = [
  {
    id: 'clients',
    label: 'For clients',
    icon: 'person_search',
    title: 'Need help with a job or service?',
    points: [
      'Post what you need or browse existing providers',
      'Compare profiles, services, and local availability',
      'Message directly and agree on terms before work starts',
    ],
    cta: 'Find a provider',
    href: `${appUrl}/providers`,
  },
  {
    id: 'providers',
    label: 'For providers',
    icon: 'engineering',
    title: 'Ready to offer your skills?',
    points: [
      'Create a profile that showcases your work and area',
      'List services, respond to opportunities, and get discovered',
      'Build trust through clear communication and completed jobs',
    ],
    cta: 'Create your profile',
    href: `${appUrl}/register`,
  },
] as const;

const faqs = [
  {
    q: 'Is Service Loop free to use?',
    a: 'Browsing, connecting, and messaging are free. Any payments for services happen directly between clients and providers.',
  },
  {
    q: 'Who can join as a provider?',
    a: 'Anyone offering a legitimate local service — from skilled trades to everyday help — can create a profile and list what they do.',
  },
  {
    q: 'How do I know who to trust?',
    a: 'Review profiles, service details, and conversation history before agreeing to work. Clear communication is the foundation of every good match.',
  },
  {
    q: 'Which areas does Service Loop cover?',
    a: 'Service Loop is built for Zimbabwe and supports discovery across all provinces, with a focus on local, nearby connections.',
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 26 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HowItWorksPage() {
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <SiteHeader />

      {/* Hero */}
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
            HOW IT WORKS
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
          >
            Local work, made simpler.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-gray-300 md:text-lg"
          >
            Service Loop helps people discover local services, connect directly, and move from
            request to completed work with less friction.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {['Search', 'Connect', 'Get it done'].map((label, i) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fb7152] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Core steps */}
      <section className="relative -mt-12 bg-[#f8f9fb] px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-5xl space-y-8">
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              custom={index * 0.1}
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.09)]"
            >
              <div
                className={`grid items-center gap-0 md:grid-cols-2 ${index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                <div className="relative h-56 overflow-hidden md:h-full md:min-h-[320px]">
                  <img
                    src={step.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${step.accent} mix-blend-multiply opacity-80`} />
                  <div
                    className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full ${step.badge} text-sm font-bold text-white shadow-lg`}
                  >
                    {step.number}
                  </div>
                  <div className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg">
                    <span className="material-symbols-outlined text-[24px] text-gray-800">{step.icon}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-8 md:p-10">
                  <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#fb7152]">
                    Step {step.number.replace('0', '')} · {step.title}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                    {step.headline}
                  </h2>
                  <p className="mt-4 leading-relaxed text-gray-600">{step.description}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-3 py-1 text-[12px] font-semibold text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Animated conversation demo */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="w-full bg-white py-16 md:py-24"
      >
        <div className="mx-auto mb-10 max-w-3xl px-5 text-center md:px-8">
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#fb7152]">See it in action</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Real conversations, real results
          </h2>
          <p className="mt-4 text-gray-500">
            Watch how a client and provider connect, agree, and get work done — all through Service Loop.
          </p>
        </div>
        <MarketplaceConversation />
      </motion.section>

      {/* Audience paths */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="mx-auto max-w-5xl"
        >
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#fb7152]">Two sides, one platform</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Built for clients and providers
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {audiences.map((audience) => (
              <motion.div
                key={audience.id}
                variants={itemVariants}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="flex flex-col rounded-[26px] border border-gray-100 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fb7152]/10">
                  <span className="material-symbols-outlined text-[26px] text-[#fb7152]">{audience.icon}</span>
                </div>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-gray-400">{audience.label}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">{audience.title}</h3>
                <ul className="mt-5 flex-1 space-y-3">
                  {audience.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] leading-relaxed text-gray-600">
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-emerald-500">
                        check_circle
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => window.location.assign(audience.href)}
                  className="mt-8 h-12 w-full justify-center gap-2 border-none text-[15px] sm:w-auto"
                >
                  {audience.cta}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Full journey */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <JourneySection />
      </motion.div>

      {/* FAQ */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: true }}
            variants={containerVariants}
            className="mb-10 text-center"
          >
            <motion.p variants={itemVariants} className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#fb7152]">
              FAQ
            </motion.p>
            <motion.h2 variants={itemVariants} className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Common questions
            </motion.h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={faq.q}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-[#f8f9fb]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25 }}
                      className="material-symbols-outlined shrink-0 text-gray-400"
                    >
                      expand_more
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 leading-relaxed text-gray-600">{faq.a}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
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
            Ready to get started?
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-gray-300">
            Join Service Loop and discover local work the simpler way.
          </motion.p>
          <motion.div variants={itemVariants} className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
            <Button
              onClick={() => window.location.assign(`${appUrl}/home`)}
              className="h-14 w-full border-none px-8 text-[16px] shadow-lg sm:w-auto"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">arrow_forward</span>
              Enter Service Loop
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.assign(`${appUrl}/providers`)}
              className="h-14 w-full border-white/25 px-8 text-[16px] sm:w-auto"
            >
              Explore services
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
