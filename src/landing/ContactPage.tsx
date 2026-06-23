import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');
const email = 'hello@serviceloop.co.zw';

const contactMethods = [
  {
    icon: 'mail',
    title: 'Email us',
    description: 'For general questions, feedback, or support.',
    action: email,
    href: `mailto:${email}`,
    external: false,
  },
  {
    icon: 'engineering',
    title: 'For providers',
    description: 'Tell us what service you offer and where you work.',
    action: 'Start your profile',
    href: `${appUrl}/register`,
    external: true,
  },
  {
    icon: 'person_search',
    title: 'For clients',
    description: 'Tell us what you need help with or how we can improve.',
    action: 'Browse providers',
    href: `${appUrl}/providers`,
    external: true,
  },
] as const;

const topics = ['General enquiry', 'Provider support', 'Client support', 'Partnership', 'Feedback'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
};

export function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '' });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Service Loop — ${form.topic}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic}\n\n${form.message}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

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
            CONTACT
          </motion.p>
          <motion.h1 variants={itemVariants} className="text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            Let&apos;s talk.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-gray-300 md:text-lg"
          >
            For questions, feedback, partnerships, or support — send us a message and the Service Loop team will get
            back to you.
          </motion.p>
        </motion.div>
      </section>

      <section className="relative -mt-10 px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr]">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-5"
          >
            {contactMethods.map((method) => (
              <motion.div
                key={method.title}
                variants={itemVariants}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="rounded-[24px] border border-gray-100 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fb7152]/10">
                  <span className="material-symbols-outlined text-[22px] text-[#fb7152]">{method.icon}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{method.title}</h2>
                <p className="mt-2 leading-relaxed text-gray-600">{method.description}</p>
                {method.external ? (
                  <button
                    type="button"
                    onClick={() => window.location.assign(method.href)}
                    className="mt-4 inline-flex items-center gap-1 font-semibold text-[#e86043] hover:underline"
                  >
                    {method.action}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <a href={method.href} className="mt-4 inline-block font-semibold text-[#e86043] hover:underline">
                    {method.action}
                  </a>
                )}
              </motion.div>
            ))}

            <motion.div
              variants={itemVariants}
              className="rounded-[24px] border border-gray-100 bg-[#f8f9fb] p-7"
            >
              <h3 className="font-bold text-gray-900">Response time</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We aim to reply within 1–2 business days. For urgent platform issues, include as much detail as
                possible in your message.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] border border-gray-100 bg-white p-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] md:p-10"
          >
            <h2 className="text-2xl font-bold text-gray-900">Send a message</h2>
            <p className="mt-2 text-gray-600">Fill in the form and your email app will open with everything ready to send.</p>

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-emerald-50 p-6 text-emerald-800">
                <p className="font-semibold">Your email app should open shortly.</p>
                <p className="mt-2 text-sm">If it didn&apos;t, email us directly at {email}.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm font-semibold text-emerald-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-gray-700">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#fb7152] focus:ring-2 focus:ring-[#fb7152]/20"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-gray-700">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#fb7152] focus:ring-2 focus:ring-[#fb7152]/20"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold text-gray-700">
                    Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value as typeof form.topic })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#fb7152] focus:ring-2 focus:ring-[#fb7152]/20"
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#fb7152] focus:ring-2 focus:ring-[#fb7152]/20"
                    placeholder="How can we help?"
                  />
                </div>
                <Button type="submit" className="h-12 w-full border-none text-[15px] sm:w-auto">
                  <span className="material-symbols-outlined mr-2 text-[18px]">send</span>
                  Send message
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] px-5 py-16 md:px-8 md:py-20">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true }}
          variants={containerVariants}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-900 md:text-3xl">
            Prefer to explore first?
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-3 text-gray-600">
            Jump into Service Loop or learn how the marketplace works before reaching out.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button onClick={() => window.location.assign(`${appUrl}/home`)} className="h-12 border-none px-8">
              Enter Service Loop
            </Button>
            <Button variant="ghost" onClick={() => window.location.assign('/how-it-works')} className="h-12 px-8">
              How it works
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
