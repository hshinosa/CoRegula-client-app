import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  FileText,
  Edit,
  Trash2,
  Play,
  Clock,
  Users,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

import lecturer from '@/routes/lecturer';

interface TemplateConfiguration {
  max_participants?: number;
  rules?: string[];
  settings?: Record<string, unknown>;
  auto_close_timeout_minutes?: number;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  configuration?: TemplateConfiguration;
  created_at: string;
}

interface Props {
  templates: Template[];
  onEdit?: (template: Template) => void;
  onDelete?: (templateId: string) => void;
  onApply?: (templateId: string) => void;
}

export default function TemplatesList({ templates, onEdit, onDelete, onApply }: Props) {
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleApply = (templateId: string) => {
    const sessionName = prompt('Enter session name:');
    if (!sessionName) return;

    setApplyingId(templateId);
    router.post(lecturer.sessionTemplates.apply.url(templateId), {
      session_name: sessionName,
    }, {
      onSuccess: () => {
        setApplyingId(null);
        onApply?.(templateId);
      },
      onError: () => {
        setApplyingId(null);
      },
    });
  };

  const handleDelete = (templateId: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;

    router.delete(lecturer.sessionTemplates.destroy.url(templateId), {
      onSuccess: () => onDelete?.(templateId),
    });
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
        <p className="mt-1 text-sm text-gray-500">
          Save a session as a template to reuse configurations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onEdit?.(template)}
                  className="p-1 text-gray-600 hover:text-gray-600"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-1 text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Configuration Preview */}
            {template.configuration && (
              <div className="mt-3 space-y-2">
                {template.configuration.max_participants && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>Max {template.configuration.max_participants} participants</span>
                  </div>
                )}

                {template.configuration.auto_close_timeout_minutes && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>Auto-close after {template.configuration.auto_close_timeout_minutes}m</span>
                  </div>
                )}

                {template.configuration.rules && template.configuration.rules.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span>{template.configuration.rules.length} rule(s)</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-600">
                Created {new Date(template.created_at).toLocaleDateString()}
              </span>

              <button
                onClick={() => handleApply(template.id)}
                disabled={applyingId === template.id}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-brand-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Play className="w-3 h-3 mr-1" />
                {applyingId === template.id ? 'Creating...' : 'Use Template'}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
