'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function AdminPasswordCard() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || 'Failed to update password');
      }

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-strong p-6 sm:p-8 rounded-2xl border border-gold/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-gold" />
        <h2 className="text-2xl font-bold text-gold">Change Password</h2>
      </div>

      <div className="mb-6 p-4 bg-gold/10 border border-gold/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
          <div className="text-sm text-soft-gray/90">
            <p className="font-semibold text-gold mb-1">Current Password:</p>
            <p className="font-mono">12345678</p>
            <p className="mt-2 text-soft-gray/70">
              To change the password permanently, update <code className="text-gold">ADMIN_PASSWORD</code> in <code className="text-gold">.env.local</code> and restart the server.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-soft-gray/80 text-sm mb-2">
            New Password <span className="text-gold">*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError('');
            }}
            required
            minLength={8}
            className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors"
          />
          <p className="text-xs text-soft-gray/60 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-soft-gray/80 text-sm mb-2">
            Confirm New Password <span className="text-gold">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            required
            className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-3 text-off-white focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-lg p-3 text-gold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-lg p-3 text-gold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Password change feature coming soon. For now, update .env.local and restart server.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gold text-dark-green-primary px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </motion.div>
  );
}
