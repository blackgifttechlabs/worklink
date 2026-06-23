import { SiteHeader } from '@/components/layout/SiteHeader';
import { Footer } from '@/components/layout/Footer';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');

const content = {
  privacy: { eyebrow: 'PRIVACY POLICY', title: 'Your information, handled with care.', intro: 'This policy explains the information Service Loop collects and how it is used to provide and improve the marketplace.', sections: [['Information we collect', 'We collect account details, profile information, service information, and activity needed to operate the platform.'], ['How we use it', 'We use this information to provide marketplace features, support users, keep the platform secure, and improve the service.'], ['Your choices', 'You can update your profile information and contact us about privacy questions at hello@serviceloop.co.zw.']] },
  terms: { eyebrow: 'TERMS OF SERVICE', title: 'Using Service Loop responsibly.', intro: 'These terms set out the basic rules for using the Service Loop marketplace.', sections: [['Use of the platform', 'Provide accurate information, use the platform lawfully, and treat other users respectfully.'], ['Marketplace relationships', 'Service Loop helps users discover and connect. Users remain responsible for the services, agreements, and transactions they make.'], ['Keeping the platform safe', 'We may restrict access where needed to protect users, enforce these terms, or maintain platform security.']] },
} as const;

export function InfoPage({ page }: { page: keyof typeof content }) {
  const data = content[page];
  return <div className="min-h-screen bg-[#f8f9fb] font-sans"><SiteHeader /><main>
    <section className="bg-[#1a232c] px-5 py-20 text-center text-white md:px-8 md:py-28"><p className="mb-5 text-[12px] font-black tracking-[0.2em] text-[#fb7152]">{data.eyebrow}</p><h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{data.title}</h1><p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-gray-300">{data.intro}</p></section>
    <section className="mx-auto grid max-w-5xl gap-5 px-5 py-16 md:grid-cols-3 md:px-8 md:py-24">{data.sections.map(([title, text]) => <article key={title} className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"><span className="material-symbols-outlined text-[#fb7152]">check_circle</span><h2 className="mt-5 text-xl font-bold text-gray-900">{title}</h2><p className="mt-3 leading-relaxed text-gray-600">{text}</p></article>)}</section>
    <section className="px-5 pb-20 text-center"><a href={`${appUrl}/home`} className="inline-flex rounded-full bg-[#fb7152] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#e86043]">Enter Service Loop <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span></a></section>
  </main><Footer /></div>;
}
