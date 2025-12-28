'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Scale, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import SectionTitle from '@/components/SectionTitle';
import Footer from '@/components/Footer';
import { useLanguage } from '@/components/LanguageProvider';
import Link from 'next/link';

export default function Home() {
  const { t, lang } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(lang === 'de' ? 'Vielen Dank für deine Nachricht. Wir melden uns bald bei dir.' : 'Thank you for your message. We will get back to you soon.');
    setFormData({ email: '', message: '' });
  };

  // Fetch real voices for homepage preview
  const [homepageVoices, setHomepageVoices] = useState<Array<{ message: string; createdAt: string }>>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);

  useEffect(() => {
    fetch('/api/voices?page=1&size=3&sort=newest')
      .then(async (res) => {
        let data: any;
        try {
          data = await res.json();
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          setVoicesLoading(false);
          return;
        }
        
        // Handle new API response format
        if (data.ok && data.data) {
          const items = data.data.items || [];
          setHomepageVoices(items);
        } else if (data.items) {
          // Legacy format support
          setHomepageVoices(data.items);
        } else if (data.voices) {
          // Very old format
          setHomepageVoices(data.voices);
        }
        setVoicesLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching voices:', err);
        setVoicesLoading(false);
      });
  }, []);

  // Mock data for articles
  const mockArticles = [
    {
      category: lang === 'de' ? 'Rechte' : 'Rights',
      title: lang === 'de' 
        ? 'Deine Rechte als Pflege-Auszubildender verstehen'
        : 'Understanding your rights as a nursing trainee',
      excerpt: lang === 'de'
        ? 'Erfahre mehr über die rechtlichen Schutzmöglichkeiten und Rechte, die du während deiner Pflegeausbildung hast.'
        : 'Learn about the legal protections and rights you have during your nursing training program.',
      link: '/articles',
    },
    {
      category: lang === 'de' ? 'Wohlbefinden' : 'Wellness',
      title: lang === 'de'
        ? 'Burnout früh erkennen'
        : 'Recognizing burnout early',
      excerpt: lang === 'de'
        ? 'Frühe Warnsignale von Burnout und wie man sie angeht, bevor sie deine Ausbildung beeinträchtigen.'
        : 'Early warning signs of burnout and how to address them before they impact your training.',
      link: '/articles',
    },
    {
      category: lang === 'de' ? 'Orientierung' : 'Guidance',
      title: lang === 'de'
        ? 'Sicher über Probleme sprechen'
        : 'How to speak up safely during training',
      excerpt: lang === 'de'
        ? 'Praktische Anleitung, wie man Bedenken zu Arbeitsbedingungen und Behandlung respektvoll äußert.'
        : 'Practical guidance on raising concerns about working conditions and treatment respectfully.',
      link: '/articles',
    },
  ];

  const rights = t('home.rights.rightsList') as string[];
  const steps = [
    {
      number: 1,
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
    },
    {
      number: 2,
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
    },
    {
      number: 3,
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
    },
  ];

  return (
    <main className="min-h-screen relative z-10">
      <Navbar />
      <Hero />

      {/* What This Platform Provides */}
      <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title={t('home.features.title')}
            subtitle={t('home.features.subtitle')}
          />
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 md:mt-16">
            <FeatureCard
              icon={<MessageSquare className="w-10 h-10 sm:w-12 sm:h-12" />}
              title={t('home.features.voice.title')}
              description={t('home.features.voice.description')}
              index={0}
            />
            <FeatureCard
              icon={<Scale className="w-10 h-10 sm:w-12 sm:h-12" />}
              title={t('home.features.rights.title')}
              description={t('home.features.rights.description')}
              index={1}
            />
            <FeatureCard
              icon={<Mail className="w-10 h-10 sm:w-12 sm:h-12" />}
              title={t('home.features.support.title')}
              description={t('home.features.support.description')}
              index={2}
            />
          </div>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-green-2/20 relative">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title={t('home.howItWorks.title')}
            subtitle={t('home.howItWorks.subtitle')}
          />
          
          {/* Desktop Timeline */}
          <div className="hidden md:block mt-16">
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 transform -translate-y-1/2">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gold"
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
              </div>

              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="flex flex-col items-center w-1/3"
                  >
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-6 shadow-lg shadow-gold/30">
                        <span className="text-2xl font-bold text-dark-green-primary">{step.number}</span>
                      </div>
                    </div>
                    <div className="text-center max-w-xs">
                      <h3 className="text-xl font-bold text-off-white mb-2">{step.title}</h3>
                      <p className="text-soft-gray/80 text-sm">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden mt-12 space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-gold/30">
                    <span className="text-xl font-bold text-dark-green-primary">{step.number}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-off-white mb-1">{step.title}</h3>
                  <p className="text-soft-gray/80 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Anonymous Voice Preview */}
      <section id="voice" className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title={t('home.voices.title')}
            subtitle={t('home.voices.subtitle')}
          />
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 mt-8 sm:mt-12 md:mt-16 items-center">
            {/* Left: Encouragement Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-bold text-off-white">{t('home.voices.encouragement.title')}</h3>
              <p className="text-soft-gray/90 text-lg leading-relaxed">
                {t('home.voices.encouragement.text')}
              </p>
              <div className="flex items-center gap-2 text-soft-gray/70 text-sm mt-6">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>{t('home.voices.encouragement.safety')}</span>
              </div>
            </motion.div>

            {/* Right: Message Bubbles */}
            <div className="relative space-y-4">
              {homepageVoices.length > 0 ? (
                homepageVoices.map((voice, index) => (
                  <motion.div
                    key={voice.createdAt + index}
                    initial={{ opacity: 0, y: 30, rotate: -2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-strong p-6 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all duration-300"
                    style={{
                      transform: `rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                    }}
                  >
                    <p className="text-soft-gray/90 text-sm leading-relaxed">
                      {voice.message.length > 150 ? `${voice.message.substring(0, 150)}...` : voice.message}
                    </p>
                  </motion.div>
                ))
              ) : voicesLoading ? (
                <div className="glass-strong p-6 rounded-2xl border border-gold/10 text-center">
                  <p className="text-soft-gray/60 text-sm">
                    {lang === 'de' ? 'Lade Stimmen...' : 'Loading voices...'}
                  </p>
                </div>
              ) : (
                <div className="glass-strong p-6 rounded-2xl border border-gold/10 text-center">
                  <p className="text-soft-gray/60 text-sm">
                    {lang === 'de' ? 'Noch keine Stimmen. Sei die erste, die sicher teilt.' : 'No voices yet. Be the first to share safely.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/voices"
              className="inline-flex items-center gap-2 bg-gold text-dark-green-primary px-8 py-4 rounded-2xl font-semibold hover:bg-gold/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-gold/30"
            >
              {t('home.voices.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rights & Contact Preview */}
      <section id="rights" className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-green-2/20 relative">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title={t('home.rights.title')}
            subtitle={t('home.rights.subtitle')}
          />
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 mt-8 sm:mt-12 md:mt-16">
            {/* Left: Rights */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-strong p-8 rounded-2xl border border-gold/10"
            >
              <h3 className="text-2xl font-bold text-gold mb-6">{t('home.rights.rightsTitle')}</h3>
              <div className="space-y-3">
                {rights.map((right, index) => (
                  <motion.div
                    key={right}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-gold rounded-full"></div>
                    <span className="text-soft-gray/90">{right}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-strong p-8 rounded-2xl border border-gold/10"
            >
              <h3 className="text-2xl font-bold text-gold mb-6">{t('home.rights.contactTitle')}</h3>
              <p className="text-soft-gray/80 text-sm mb-6">
                {t('home.rights.contactNote')}
              </p>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-soft-gray/80 text-sm mb-2">
                    {t('help.step3.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-soft-gray/80 text-sm mb-2">
                    {t('home.rights.contactTitle')} <span className="text-gold">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-dark-green-primary px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {t('help.submit')}
                </button>
              </form>
            </motion.div>
          </div>
          
          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-8 glass p-4 rounded-xl border border-gold/20"
          >
            <p className="text-soft-gray/80 text-sm text-center">
              <strong className="text-gold">{t('home.rights.disclaimer')}</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Articles Preview */}
      <section id="articles" className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title={t('home.articles.title')}
            subtitle={t('home.articles.subtitle')}
          />
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 md:mt-16">
            {mockArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-strong p-6 rounded-2xl border border-gold/10 hover:border-gold/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
              >
                <div className="mb-4">
                  <span className="inline-block bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-semibold">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-off-white mb-3 group-hover:text-gold transition-colors">
                  {article.title}
                </h3>
                <p className="text-soft-gray/80 text-sm mb-4 leading-relaxed">{article.excerpt}</p>
                <Link
                  href={article.link}
                  className="inline-flex items-center gap-2 text-gold font-semibold text-sm hover:gap-3 transition-all"
                >
                  {lang === 'de' ? 'Mehr lesen' : 'Read more'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 bg-gold text-dark-green-primary px-8 py-4 rounded-2xl font-semibold hover:bg-gold/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-gold/30"
            >
              {t('home.articles.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
