import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Play,
  X,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import lecturer from '@/routes/lecturer';

interface Session {
  id: string;
  name: string;
  description?: string;
  scheduled_at: string;
  status: string;
}

interface Props {
  sessions: Session[];
  onCancel?: (sessionId: string) => void;
  onActivate?: (sessionId: string) => void;
}

export default function ScheduledSessionsList({ sessions, onCancel, onActivate }: Props) {
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const newCountdowns: Record<string, string> = {};

      sessions.forEach(session => {
        const scheduledTime = new Date(session.scheduled_at).getTime();
        const diff = scheduledTime - now;

        if (diff <= 0) {
          newCountdowns[session.id] = 'Ready to activate';
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (hours > 0) {
            newCountdowns[session.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else if (minutes > 0) {
            newCountdowns[session.id] = `${minutes}m ${seconds}s`;
          } else {
            newCountdowns[session.id] = `${seconds}s`;
          }
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  const handleCancel = (sessionId: string) => {
    if (!confirm('Cancel this scheduled session?')) return;

    router.post(lecturer.sessions.cancelSchedule.url(sessionId), {}, {
      onSuccess: () => onCancel?.(sessionId),
    });
  };

  const handleActivate = (sessionId: string) => {
    router.post(lecturer.sessions.activate.url(sessionId), {}, {
      onSuccess: () => onActivate?.(sessionId),
    });
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled sessions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Schedule a session to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => {
        const isReady = countdowns[session.id] === 'Ready to activate';

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-lg border p-4 ${
              isReady ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {session.name}
                  </h3>
                  {isReady && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ready
                    </span>
                  )}
                </div>

                {session.description && (
                  <p className="mt-1 text-sm text-gray-500">{session.description}</p>
                )}

                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(session.scheduled_at).toLocaleString()}
                  </div>

                  <div className={`flex items-center font-medium ${
                    isReady ? 'text-green-600' : 'text-indigo-600'
                  }`}>
                    {isReady ? (
                      <Play className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {countdowns[session.id] || 'Calculating...'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {isReady && (
                  <button
                    onClick={() => handleActivate(session.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Activate Now
                  </button>
                )}

                <button
                  onClick={() => handleCancel(session.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
