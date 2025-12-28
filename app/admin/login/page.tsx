'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Invalid password';
        console.error('[Login] Login failed:', errorMsg, 'Status:', response.status);
        throw new Error(errorMsg);
      }

      if (data.success) {
        console.log('[Login] Login successful, redirecting...');
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-strong p-8 rounded-2xl border border-gold/10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
                <Shield className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-3xl font-bold text-gold mb-2">Admin Login</h1>
              <p className="text-soft-gray/80 text-sm">Enter your password to access the admin area</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-soft-gray/80 text-sm mb-2">
                  Password <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gold/60" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg pl-11 pr-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors"
                    placeholder="Enter admin password"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-gold/10 border border-gold/20 rounded-lg p-3 text-gold text-sm">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gold text-dark-green-primary px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gold/30"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}

