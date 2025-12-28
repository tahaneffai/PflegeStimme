'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface VoiceFormProps {
  onSuccess: () => void;
}

export default function VoiceForm({ onSuccess }: VoiceFormProps) {
  const { t, lang } = useLanguage();
  const [message, setMessage] = useState('');
  const [topicTags, setTopicTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const maxLength = 2000;
  const minLength = 20;
  const remainingChars = maxLength - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (message.trim().length < minLength) {
      setError(lang === 'de' 
        ? `Nachricht muss mindestens ${minLength} Zeichen lang sein.`
        : `Message must be at least ${minLength} characters long.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/voices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          topicTags: topicTags.trim() || null,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      // API always returns 200, check ok flag
      if (!data.ok) {
        // Extract error message from new API response format
        let errorMsg = 'Failed to submit';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          } else if (typeof data.error === 'object') {
            errorMsg = JSON.stringify(data.error);
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
        throw new Error(errorMsg);
      }

      // Handle degraded state
      if (data.degraded) {
        const degradedMsg = data.data?.message || data.message || (lang === 'de' 
          ? 'Service temporär nicht verfügbar. Bitte später erneut versuchen.'
          : 'Service temporarily unavailable. Please try again later.');
        throw new Error(degradedMsg);
      }

      // Extract success message from response
      const successMsg = data.data?.message || data.message || (lang === 'de'
        ? 'Danke! Deine Nachricht wurde erhalten und erscheint nach Prüfung.'
        : 'Thank you! Your message was received and will appear after review.');

      setMessage('');
      setTopicTags('');
      setSuccess(true);
      // Don't call onSuccess() to avoid refreshing the list (message is pending)

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      // Safely extract error message
      let errorMsg = 'An error occurred';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = String(err.message);
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-strong p-6 sm:p-8 rounded-2xl border border-gold/10"
    >
      <h3 className="text-2xl font-bold text-gold mb-6">
        {t('voices.cta')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-soft-gray/80 text-sm mb-2">
            {lang === 'de' ? 'Deine Nachricht' : 'Your Message'} <span className="text-gold">*</span>
          </label>
          <textarea
            id="message"
            required
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError('');
            }}
            rows={6}
            maxLength={maxLength}
            className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors resize-none"
            placeholder={lang === 'de' 
              ? 'Teile deine Erfahrung hier... (mindestens 20 Zeichen)'
              : 'Share your experience here... (minimum 20 characters)'}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${remainingChars < 50 ? 'text-gold' : 'text-soft-gray/60'}`}>
              {remainingChars} {lang === 'de' ? 'Zeichen übrig' : 'characters remaining'}
            </span>
            {message.length > 0 && message.length < minLength && (
              <span className="text-xs text-gold">
                {minLength - message.length} {lang === 'de' ? 'mehr benötigt' : 'more needed'}
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-soft-gray/80 text-sm mb-2">
            {lang === 'de' ? 'Themen (optional, durch Komma getrennt)' : 'Topics (optional, comma-separated)'}
          </label>
          <input
            type="text"
            id="tags"
            value={topicTags}
            onChange={(e) => setTopicTags(e.target.value)}
            className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors"
            placeholder={lang === 'de' ? 'z.B. Überforderung, Respekt' : 'e.g. Overload, Respect'}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-gold text-sm bg-gold/10 p-3 rounded-lg border border-gold/20">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gold text-sm bg-gold/10 p-4 rounded-lg border border-gold/20"
          >
            <span className="text-lg">✓</span>
            <span>
              {lang === 'de' 
                ? 'Danke! Deine Nachricht wurde erhalten und erscheint nach Prüfung.'
                : 'Thank you! Your message was received and will appear after review.'}
            </span>
          </motion.div>
        )}

        <div className="glass p-4 rounded-xl border border-gold/20">
          <p className="text-soft-gray/80 text-xs leading-relaxed">
            <strong className="text-gold">
              {lang === 'de' ? 'Sicherheit:' : 'Safety:'}
            </strong>{' '}
            {lang === 'de'
              ? 'Keine Namen, keine Einrichtungen, keine persönlichen Daten.'
              : 'No names, no facilities, no personal data.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || message.trim().length < minLength}
          className="w-full bg-gold text-dark-green-primary px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>{lang === 'de' ? 'Wird übermittelt...' : 'Submitting...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{lang === 'de' ? 'Anonym absenden' : 'Submit Anonymously'}</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

