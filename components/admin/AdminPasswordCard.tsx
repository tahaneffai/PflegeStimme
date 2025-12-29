'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminPasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
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
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const errorMessage = data.error?.message || 'Failed to update password';
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setCurrentPassword('');
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
      className="glass-strong p-6 rounded-2xl border border-gold/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gold/10 rounded-lg">
          <Lock className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gold">Change Password</h3>
          <p className="text-xs text-soft-gray/70">Update your admin account password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-soft-gray/80 text-sm font-medium mb-2">
            Current Password <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError('');
              }}
              required
              className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-2.5 pr-10 text-off-white focus:outline-none focus:border-gold transition-colors"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-gray/60 hover:text-gold transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-soft-gray/80 text-sm font-medium mb-2">
            New Password <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              required
              minLength={8}
              className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-2.5 pr-10 text-off-white focus:outline-none focus:border-gold transition-colors"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-gray/60 hover:text-gold transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-soft-gray/60 mt-1.5">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-soft-gray/80 text-sm font-medium mb-2">
            Confirm New Password <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              required
              className="w-full bg-dark-green-3/50 border border-dark-green-mid rounded-lg px-4 py-2.5 pr-10 text-off-white focus:outline-none focus:border-gold transition-colors"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-gray/60 hover:text-gold transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-lg p-3 text-gold text-sm"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Password updated successfully!</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gold text-dark-green-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-gold/90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </motion.div>
  );
}
