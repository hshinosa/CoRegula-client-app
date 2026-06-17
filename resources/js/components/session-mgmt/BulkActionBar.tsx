import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  X,
  Archive,
  Trash2,
  Power,
  CheckSquare,
} from 'lucide-react';

import lecturer from '@/routes/lecturer';

interface Props {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete?: () => void;
}

export default function BulkActionBar({
  selectedCount,
  selectedIds,
  onClearSelection,
  onActionComplete,
}: Props) {
  if (selectedCount === 0) return null;

  const handleClose = () => {
    if (!confirm(`Close ${selectedCount} session(s)?`)) return;

    router.post(
      lecturer.sessions.bulk.close.url(),
      { session_ids: selectedIds },
      {
        onSuccess: () => {
          onClearSelection();
          onActionComplete?.();
        },
      }
    );
  };

  const handleArchive = () => {
    if (!confirm(`Archive ${selectedCount} session(s)?`)) return;

    router.post(
      lecturer.sessions.bulk.archive.url(),
      { session_ids: selectedIds },
      {
        onSuccess: () => {
          onClearSelection();
          onActionComplete?.();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm(`Permanently delete ${selectedCount} session(s)? This cannot be undone.`)) return;

    router.post(
      lecturer.sessions.bulk.destroy.url(),
      { session_ids: selectedIds },
      {
        onSuccess: () => {
          onClearSelection();
          onActionComplete?.();
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 inset-x-0 pb-4 px-4 z-50"
    >
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-2xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium text-white">
                {selectedCount} selected
              </span>
            </div>

            <div className="h-6 w-px bg-gray-700" />

            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Power className="w-3.5 h-3.5 mr-1.5" />
                Close
              </button>

              <button
                onClick={handleArchive}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Archive className="w-3.5 h-3.5 mr-1.5" />
                Archive
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-red-300 bg-red-900/50 hover:bg-red-900/70 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </button>
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-600 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
