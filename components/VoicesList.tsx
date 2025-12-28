'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VoiceCard from './VoiceCard';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface Voice {
  id: string;
  message: string;
  createdAt: string;
  topicTags: string | null;
}

interface VoicesListProps {
  initialVoices: Voice[];
  initialPagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function VoicesList({ initialVoices, initialPagination }: VoicesListProps) {
  const { t, lang } = useLanguage();
  const [voices, setVoices] = useState<Voice[]>(initialVoices);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMore = async () => {
    if (isLoading || !pagination.hasMore) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/voices?page=${pagination.page + 1}&size=${pagination.size}&sort=newest`
      );

      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[VoicesList] JSON parse error:', jsonError);
        setError(lang === 'de' ? 'Fehler beim Laden.' : 'Error loading.');
        setPagination((prev) => ({ ...prev, hasMore: false }));
        return;
      }
      
      // Handle error response
      if (!data.ok) {
        const errorMsg = data.error?.message || data.error || (lang === 'de' ? 'Fehler beim Laden.' : 'Error loading.');
        setError(errorMsg);
        setPagination((prev) => ({ ...prev, hasMore: false }));
        return;
      }

      // Extract items from response (handle both old and new format)
      const items = data.data?.items || data.items || [];
      
      // Ensure items is an array and map safely
      const safeItems: Voice[] = Array.isArray(items)
        ? items.map((v: any) => ({
            id: String(v.id || ''),
            message: String(v.message || ''),
            createdAt: String(v.createdAt || new Date().toISOString()),
            topicTags: v.topicTags ? String(v.topicTags) : null,
          }))
        : [];

      if (response.ok && safeItems.length > 0) {
        setVoices((prev) => [...prev, ...safeItems]);
        const paginationData = data.data || data;
        setPagination({
          page: Number(paginationData.page) || pagination.page + 1,
          size: Number(paginationData.size) || pagination.size,
          total: Number(paginationData.total) || 0,
          totalPages: Number(paginationData.totalPages) || 0,
          hasMore: Boolean(paginationData.hasMore) || false,
        });
        
        // Show degraded warning if needed
        if (data.degraded) {
          setError(lang === 'de' ? 'Datenbank temporär nicht verfügbar. Bitte später erneut versuchen.' : 'Database temporarily unavailable. Please try again later.');
        }
      } else {
        // No more items or error
        setPagination((prev) => ({ ...prev, hasMore: false }));
        if (data.degraded) {
          setError(lang === 'de' ? 'Datenbank temporär nicht verfügbar.' : 'Database temporarily unavailable.');
        }
      }
    } catch (err) {
      console.error('Error loading more voices:', err);
      setError(lang === 'de' ? 'Fehler beim Laden. Bitte später erneut versuchen.' : 'Error loading. Please try again later.');
      setPagination((prev) => ({ ...prev, hasMore: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVoices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/voices?page=1&size=12&sort=newest');
      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[VoicesList] JSON parse error on refresh:', jsonError);
        setError(lang === 'de' ? 'Fehler beim Aktualisieren.' : 'Error refreshing.');
        return;
      }
      
      // Handle error response
      if (!data.ok) {
        const errorMsg = data.error?.message || data.error || (lang === 'de' ? 'Fehler beim Aktualisieren.' : 'Error refreshing.');
        setError(errorMsg);
        return;
      }

      // Extract items from response (handle both old and new format)
      const items = data.data?.items || data.items || [];
      
      // Ensure items is an array and map safely
      const safeItems: Voice[] = Array.isArray(items)
        ? items.map((v: any) => ({
            id: String(v.id || ''),
            message: String(v.message || ''),
            createdAt: String(v.createdAt || new Date().toISOString()),
            topicTags: v.topicTags ? String(v.topicTags) : null,
          }))
        : [];

      if (response.ok && safeItems.length >= 0) {
        setVoices(safeItems);
        const paginationData = data.data || data;
        setPagination({
          page: Number(paginationData.page) || 1,
          size: Number(paginationData.size) || 12,
          total: Number(paginationData.total) || 0,
          totalPages: Number(paginationData.totalPages) || 0,
          hasMore: Boolean(paginationData.hasMore) || false,
        });
        
        // Show degraded warning if needed
        if (data.degraded) {
          setError(lang === 'de' ? 'Datenbank temporär nicht verfügbar.' : 'Database temporarily unavailable.');
        } else {
          setError(''); // Clear error on successful refresh
        }
      }
    } catch (err) {
      console.error('Error refreshing voices:', err);
      setError(lang === 'de' ? 'Fehler beim Aktualisieren.' : 'Error refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  if (voices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong p-12 rounded-2xl border border-gold/10 text-center"
      >
        <p className="text-soft-gray/80 text-lg mb-4">
          {lang === 'de'
            ? 'Noch keine Stimmen. Sei die erste, die sicher teilt.'
            : 'No voices yet. Be the first to share safely.'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voices.map((voice, index) => (
          <VoiceCard
            key={voice.id}
            message={voice.message}
            createdAt={voice.createdAt}
            topicTags={voice.topicTags}
            index={index}
          />
        ))}
      </div>

      {error && (
        <div className="text-center text-gold text-sm">
          {error}
        </div>
      )}

      {pagination.hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-gold text-dark-green-primary px-8 py-3 rounded-lg font-semibold hover:bg-gold/90 hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span>{lang === 'de' ? 'Lädt...' : 'Loading...'}</span>
            ) : (
              <>
                <span>{lang === 'de' ? 'Mehr laden' : 'Load More'}</span>
                <ArrowDown className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-soft-gray/60 text-xs mt-2">
            {lang === 'de'
              ? `Zeige ${voices.length} von ${pagination.total} Stimmen`
              : `Showing ${voices.length} of ${pagination.total} voices`}
          </p>
        </div>
      )}

      {!pagination.hasMore && voices.length > 0 && (
        <div className="text-center text-soft-gray/60 text-sm py-4">
          {lang === 'de' ? 'Alle Stimmen geladen.' : 'All voices loaded.'}
        </div>
      )}

      {/* Expose refresh function to parent via ref or callback */}
      <div style={{ display: 'none' }} data-refresh={refreshVoices.toString()} />
    </div>
  );
}

