import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  AlertTriangle,
  Check,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import lecturer from '@/routes/lecturer';

interface Props {
  sessionId: string;
  currentTimeout?: number;
  lastActivityAt?: string;
  autoCloseAt?: string;
  onUpdate?: (timeout: number) => void;
}

const TIMEOUT_PRESETS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: '8 hours', value: 480 },
  { label: '24 hours', value: 1440 },
];

const GRACE_PERIOD_MINUTES = 5;

export default function AutoCloseConfig({
  sessionId,
  currentTimeout,
  lastActivityAt,
  autoCloseAt,
  onUpdate,
}: Props) {
  const [customTimeout, setCustomTimeout] = useState(currentTimeout?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!autoCloseAt) {
      setCountdown(null);
      setIsWarning(false);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const closeTime = new Date(autoCloseAt).getTime();
      const diff = closeTime - now;

      if (diff <= 0) {
        setCountdown('Closing soon...');
        setIsWarning(true);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsWarning(minutes <= GRACE_PERIOD_MINUTES);

      if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s until auto-close`);
      } else {
        setCountdown(`${seconds}s until auto-close`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [autoCloseAt]);

  const handleSave = () => {
    const timeout = parseInt(customTimeout);
    if (isNaN(timeout) || timeout < 1) return;

    router.put(lecturer.sessions.autoClose.url(sessionId), {
      auto_close_timeout_minutes: timeout,
    }, {
      onSuccess: () => {
        setIsEditing(false);
        onUpdate?.(timeout);
      },
    });
  };

  const handleDisable = () => {
    router.put(lecturer.sessions.autoClose.url(sessionId), {
      auto_close_timeout_minutes: null,
    }, {
      onSuccess: () => {
        setCustomTimeout('');
        setIsEditing(false);
        onUpdate?.(0);
      },
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">Auto-Close Settings</h3>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Edit
          </button>
        )}
      </div>

      {/* Warning Banner */}
      {isWarning && countdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {countdown}
            </span>
          </div>
          <p className="mt-1 text-xs text-yellow-700">
            Any activity will reset the timer
          </p>
        </motion.div>
      )}

      {/* Current Status */}
      {!isEditing && (
        <div className="space-y-3">
          {currentTimeout ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Timeout</span>
                <span className="font-medium text-gray-900">{currentTimeout} minutes</span>
              </div>

              {lastActivityAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Activity</span>
                  <span className="text-gray-900">
                    {new Date(lastActivityAt).toLocaleString()}
                  </span>
                </div>
              )}

              {countdown && !isWarning && (
                <div className="flex items-center gap-2 text-sm text-indigo-600">
                  <Clock className="w-4 h-4" />
                  <span>{countdown}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Auto-close is disabled. Session will remain open indefinitely.
            </p>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIMEOUT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCustomTimeout(preset.value.toString())}
                  className={`px-3 py-2 text-sm rounded-md border ${
                    customTimeout === preset.value.toString()
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom (minutes)
            </label>
            <input
              type="number"
              value={customTimeout}
              onChange={(e) => setCustomTimeout(e.target.value)}
              min="1"
              placeholder="e.g., 45"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!customTimeout || parseInt(customTimeout) < 1}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </button>

            {currentTimeout && (
              <button
                onClick={handleDisable}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Disable
              </button>
            )}

            <button
              onClick={() => {
                setIsEditing(false);
                setCustomTimeout(currentTimeout?.toString() || '');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
