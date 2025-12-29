'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, LogOut, RefreshCw } from 'lucide-react';
import AdminVoiceCard from './AdminVoiceCard';
import AdminPasswordCard from './AdminPasswordCard';

type VoiceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Voice {
  id: string;
  message: string;
  topicTags: string | null;
  createdAt: string;
  status: VoiceStatus;
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDegraded, setIsDegraded] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const fetchVoices = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort,
        ...(status !== 'all' && { status }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/comments?${params}`);

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      // API always returns 200, check ok flag and data structure
      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[AdminDashboard] JSON parse error:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      // Handle error response
      if (!data.ok) {
        // Extract error message safely
        let errorMsg = 'Failed to fetch voices';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          } else if (typeof data.error === 'object') {
            errorMsg = 'Database error occurred';
          }
        }
        setError(errorMsg);
        setVoices([]);
        setPagination({
          total: 0,
          totalPages: 0,
          hasMore: false,
        });
        return;
      }

      // Extract data from response
      const voicesData = data.data?.comments || data.comments || [];
      const paginationData = data.data?.pagination || data.pagination;

      // Ensure voices is an array
      const safeVoices: Voice[] = Array.isArray(voicesData) 
        ? voicesData.map((v: any) => ({
            id: String(v.id || ''),
            message: String(v.message || ''),
            topicTags: v.topicTags ? String(v.topicTags) : null,
            createdAt: String(v.createdAt || new Date().toISOString()),
            status: (v.status || 'PENDING') as VoiceStatus,
          }))
        : [];

      setVoices(safeVoices);
      setPagination(paginationData || {
        total: 0,
        totalPages: 0,
        hasMore: false,
      });

      // Handle degraded state - show as warning, not blocking error
      if (data.degraded) {
        setIsDegraded(true);
        // Only show degraded warning if we have no data
        if (safeVoices.length === 0) {
          setError('Database temporarily unavailable. Please try again later.');
        } else {
          // If we have data, show a non-blocking warning
          console.warn('[AdminDashboard] Database in degraded state, but data loaded');
          setError(''); // Clear blocking error, data is available
        }
      } else {
        setIsDegraded(false);
        setError(''); // Clear error if not degraded
      }
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, status]);

  const handleSearch = () => {
    setPage(1);
    fetchVoices();
  };

  const handleEdit = async (id: string, newMessage: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      // Check for error response
      if (!response.ok) {
        throw new Error('Network error occurred');
      }

      // Check if API returned an error
      if (data.error || (data.ok === false)) {
        // Extract error message safely
        let errorMsg = data.message || 'Failed to update message';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          }
        }
        throw new Error(errorMsg);
      }

      await fetchVoices();
    } catch (error) {
      // Safely extract error message
      let errorMsg = 'Failed to update message';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMsg = String(error.message);
      }
      setError(errorMsg);
      throw error;
    }
  };

  const handleStatusChange = async (id: string, newStatus: VoiceStatus) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      // Check for error response
      if (!response.ok) {
        throw new Error('Network error occurred');
      }

      // Check if API returned an error
      if (data.error || (data.ok === false)) {
        // Extract error message safely
        let errorMsg = data.message || 'Failed to update status';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          }
        }
        throw new Error(errorMsg);
      }

      // Success - data.ok should be true or undefined (for backward compatibility)
      if (data.ok === false) {
        throw new Error('Failed to update status');
      }

      await fetchVoices();
    } catch (error) {
      // Safely extract error message
      let errorMsg = 'Failed to update status';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMsg = String(error.message);
      }
      setError(errorMsg);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      // Check for error response
      if (!response.ok) {
        throw new Error('Network error occurred');
      }

      // Check if API returned an error
      if (data.error || (data.ok === false)) {
        // Extract error message safely
        let errorMsg = data.message || 'Failed to delete message';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          }
        }
        throw new Error(errorMsg);
      }

      await fetchVoices();
    } catch (error) {
      // Safely extract error message
      let errorMsg = 'Failed to delete message';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMsg = String(error.message);
      }
      setError(errorMsg);
      throw error;
    }
  };

  const handleLogout = async () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => {
        router.push('/admin/login');
        router.refresh();
      });
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong p-6 rounded-2xl border border-gold/10"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search messages..."
              className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg pl-11 pr-4 py-2.5 text-off-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 glass border border-gold/20 rounded-lg p-1">
            {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filterStatus) => (
              <button
                key={filterStatus}
                onClick={() => {
                  setStatus(filterStatus);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  status === filterStatus
                    ? 'bg-gold text-dark-green-primary'
                    : 'text-soft-gray hover:text-gold'
                }`}
              >
                {filterStatus === 'all' ? 'All' : filterStatus}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-2.5 text-off-white focus:outline-none focus:border-gold transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <button
            onClick={handleSearch}
            className="bg-gold text-dark-green-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-gold/90 hover:scale-105 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 glass border-gold/30 text-gold px-6 py-2.5 rounded-lg font-semibold hover:border-gold/50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Degraded State Warning (non-blocking) */}
      {!isLoading && !error && voices.length > 0 && isDegraded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong p-4 rounded-xl border border-gold/30 bg-gold/5 mb-6"
        >
          <p className="text-gold text-sm text-center">
            ⚠️ Database in degraded state. Some features may be limited.
          </p>
        </motion.div>
      )}

      {/* Voices List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
            <p className="text-soft-gray/80">Loading voices...</p>
          </div>
        ) : error && voices.length === 0 ? (
          <div className="glass-strong p-6 rounded-2xl border border-gold/10 text-center">
            <p className="text-gold">{String(error)}</p>
            <button
              onClick={fetchVoices}
              className="mt-4 px-4 py-2 bg-gold text-dark-green-primary rounded-lg font-semibold hover:bg-gold/90 transition-all"
            >
              Retry
            </button>
          </div>
        ) : voices.length === 0 ? (
          <div className="glass-strong p-12 rounded-2xl border border-gold/10 text-center">
            <p className="text-soft-gray/80 text-lg">No voices found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {voices.map((voice) => (
                <AdminVoiceCard
                  key={voice.id}
                  voice={voice}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 glass border-gold/30 text-gold rounded-lg font-semibold hover:border-gold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-soft-gray/80 px-4">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 glass border-gold/30 text-gold rounded-lg font-semibold hover:border-gold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

