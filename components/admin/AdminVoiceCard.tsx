'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import AdminEditModal from './AdminEditModal';
import AdminConfirmModal from './AdminConfirmModal';

type VoiceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Voice {
  id: string;
  message: string;
  topicTags: string | null;
  createdAt: string;
  status: VoiceStatus;
}

interface AdminVoiceCardProps {
  voice: Voice;
  onEdit: (id: string, newMessage: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, newStatus: VoiceStatus) => Promise<void>;
}

export default function AdminVoiceCard({ voice, onEdit, onDelete, onStatusChange }: AdminVoiceCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'approve' | 'reject' | 'delete'; status?: VoiceStatus } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    setPendingAction({ type: 'delete' });
    setIsConfirmModalOpen(true);
  };

  const handleApprove = () => {
    setPendingAction({ type: 'approve', status: 'APPROVED' });
    setIsConfirmModalOpen(true);
  };

  const handleReject = () => {
    setPendingAction({ type: 'reject', status: 'REJECTED' });
    setIsConfirmModalOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setIsConfirmModalOpen(false);

    if (pendingAction.type === 'delete') {
      setIsDeleting(true);
      try {
        await onDelete(voice.id);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete message');
      } finally {
        setIsDeleting(false);
      }
    } else if (pendingAction.status) {
      try {
        await onStatusChange(voice.id, pendingAction.status);
      } catch (error) {
        console.error('Status change error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to update status';
        alert(errorMsg);
      }
    }

    setPendingAction(null);
  };

  const handleSave = async (newMessage: string) => {
    await onEdit(voice.id, newMessage);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="glass-strong p-4 sm:p-6 rounded-xl border border-gold/10 hover:border-gold/30 transition-all"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Calendar className="w-4 h-4 text-gold/60" />
              <span className="text-xs text-soft-gray/60">{formatDate(voice.createdAt)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                voice.status === 'APPROVED' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : voice.status === 'PENDING'
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {voice.status === 'PENDING' && <Clock className="w-3 h-3" />}
                {voice.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                {voice.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                {voice.status}
              </span>
            </div>
            <p className="text-soft-gray/90 text-sm leading-relaxed line-clamp-3">
              {voice.message}
            </p>
            {voice.topicTags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {voice.topicTags.split(',').slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gold/20 text-gold px-2 py-1 rounded-full text-xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dark-green-3/50">
          {voice.status === 'PENDING' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApprove}
                className="flex items-center gap-2 px-3 py-1.5 glass border-green-500/30 text-green-400 rounded-lg text-sm font-semibold hover:border-green-500/50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReject}
                className="flex items-center gap-2 px-3 py-1.5 glass border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:border-red-500/50 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </motion.button>
            </>
          )}
          {voice.status === 'APPROVED' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReject}
                className="flex items-center gap-2 px-3 py-1.5 glass border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:border-red-500/50 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 glass border-gold/30 text-gold rounded-lg text-sm font-semibold hover:border-gold/50 transition-all"
              >
                <Edit className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-1.5 glass border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:border-red-500/50 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </motion.button>
            </>
          )}
          {voice.status === 'REJECTED' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApprove}
                className="flex items-center gap-2 px-3 py-1.5 glass border-green-500/30 text-green-400 rounded-lg text-sm font-semibold hover:border-green-500/50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-1.5 glass border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:border-red-500/50 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      <AdminEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        message={voice.message}
        onSave={handleSave}
      />

      <AdminConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={confirmAction}
        title={
          pendingAction?.type === 'delete'
            ? 'Delete Message'
            : pendingAction?.type === 'approve'
            ? 'Approve Message'
            : 'Reject Message'
        }
        message={
          pendingAction?.type === 'delete'
            ? 'Are you sure you want to delete this message? This action cannot be undone.'
            : pendingAction?.type === 'approve'
            ? 'Are you sure you want to approve this message? It will be visible on the public site.'
            : 'Are you sure you want to reject this message? It will not be visible on the public site.'
        }
        confirmText={
          pendingAction?.type === 'delete'
            ? 'Delete'
            : pendingAction?.type === 'approve'
            ? 'Approve'
            : 'Reject'
        }
        confirmColor={
          pendingAction?.type === 'delete' || pendingAction?.type === 'reject'
            ? 'red'
            : 'green'
        }
      />
    </>
  );
}

