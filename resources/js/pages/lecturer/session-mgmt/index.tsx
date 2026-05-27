import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import lecturer from '@/routes/lecturer';
import { SharedData } from '@/types';
import { TableSkeleton } from '@/components/ui/skeletons';

interface Session {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'closed' | 'archived';
  max_participants?: number;
  scheduled_at?: string;
  auto_close_at?: string;
  last_activity_at?: string;
  auto_close_timeout_minutes?: number;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface SessionsData {
  sessions: Session[];
  pagination: Pagination;
}

interface Props {
  sessions: SessionsData;
  filters: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
    sort?: string;
    order?: string;
  };
}

type TabKey = 'active' | 'scheduled' | 'templates';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'active', label: 'Active Sessions', icon: <Users className="w-4 h-4" /> },
  { key: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" /> },
  { key: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-red-100 text-red-700',
  archived: 'bg-purple-100 text-purple-700',
};

export default function SessionManagementPage({ sessions, filters }: Props) {
  const { auth } = usePage<SharedData>().props;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    router.get(lecturer.sessions.index.url(), {
      search: searchQuery,
      status: activeTab === 'active' ? 'active' : activeTab === 'scheduled' ? 'scheduled' : undefined,
    }, { preserveState: true });
  }, [searchQuery, activeTab]);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setSelectedSessions([]);
    router.get(lecturer.sessions.index.url(), {
      status: tab === 'active' ? 'active' : tab === 'scheduled' ? 'scheduled' : undefined,
    }, { preserveState: true });
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedSessions.length === sessions.sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.sessions.map(s => s.id));
    }
  }, [selectedSessions, sessions.sessions]);

  const handleBulkAction = useCallback((action: 'close' | 'archive' | 'delete') => {
    if (selectedSessions.length === 0) return;

    const confirmMessages = {
      close: `Close ${selectedSessions.length} session(s)?`,
      archive: `Archive ${selectedSessions.length} session(s)?`,
      delete: `Permanently delete ${selectedSessions.length} session(s)? This cannot be undone.`,
    };

    if (!confirm(confirmMessages[action])) return;

    const urlMap = {
      close: lecturer.sessions.bulk.close.url(),
      archive: lecturer.sessions.bulk.archive.url(),
      delete: lecturer.sessions.bulk.destroy.url(),
    };

    router.post(urlMap[action], {
      session_ids: selectedSessions,
    }, {
      onSuccess: () => {
        setSelectedSessions([]);
        setShowBulkActions(false);
      },
    });
  }, [selectedSessions]);

  const filteredSessions = sessions.sessions.filter(session => {
    if (activeTab === 'active') return ['active', 'paused'].includes(session.status);
    if (activeTab === 'scheduled') return session.status === 'scheduled';
    return true;
  });

  return (
    <AppLayout>
      <Head title="Session Management" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {isLoading ? (
            <TableSkeleton columns={7} rows={6} />
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Session Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your chat sessions, schedules, and templates
                </p>
              </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedSessions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-brand-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Bulk Actions ({selectedSessions.length})
                  </button>

                  <AnimatePresence>
                    {showBulkActions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleBulkAction('close')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Close Selected
                          </button>
                          <button
                            onClick={() => handleBulkAction('archive')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Archive Selected
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => handleBulkAction('delete')}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Selected
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-brand-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </button>
            </div>
          </div>

          {/* Session List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auto-Close
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating a new session.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedSessions.includes(session.id)}
                            onChange={() => handleSelectSession(session.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {session.name}
                            </div>
                            {session.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {session.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {session.max_participants || '∞'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.scheduled_at ? (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(session.scheduled_at).toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.auto_close_timeout_minutes ? (
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              {session.auto_close_timeout_minutes}m
                            </div>
                          ) : (
                            <span className="text-gray-400">Off</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.get(lecturer.sessions.show.url(session.id))}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => router.delete(lecturer.sessions.destroy.url(session.id))}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sessions.pagination && sessions.pagination.last_page > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => router.get(lecturer.sessions.index.url(), { page: sessions.pagination.current_page - 1 })}
                    disabled={sessions.pagination.current_page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => router.get(lecturer.sessions.index.url(), { page: sessions.pagination.current_page + 1 })}
                    disabled={sessions.pagination.current_page === sessions.pagination.last_page}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(sessions.pagination.current_page - 1) * sessions.pagination.per_page + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(sessions.pagination.current_page * sessions.pagination.per_page, sessions.pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{sessions.pagination.total}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-brand-sm -space-x-px">
                      {Array.from({ length: sessions.pagination.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => router.get(lecturer.sessions.index.url(), { page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === sessions.pagination.current_page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSessionModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function CreateSessionModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_participants: '',
    scheduled_at: '',
    auto_close_timeout_minutes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(lecturer.sessions.store.url(), {
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      auto_close_timeout_minutes: formData.auto_close_timeout_minutes ? parseInt(formData.auto_close_timeout_minutes) : null,
      scheduled_at: formData.scheduled_at || null,
    }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create New Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Week 1 Discussion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to create as draft</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto-Close Timeout (minutes)
            </label>
            <input
              type="number"
              value={formData.auto_close_timeout_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, auto_close_timeout_minutes: e.target.value }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 30"
            />
            <p className="mt-1 text-xs text-gray-500">Session closes after this many minutes of inactivity</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg shadow-brand-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Session
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
