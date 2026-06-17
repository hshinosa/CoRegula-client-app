import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Plus,
  Trash2,
  Users,
  Shield,
  FileText,
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
  id?: string;
  name: string;
  description?: string;
  configuration?: TemplateConfiguration;
}

interface Props {
  template?: Template;
  onSave?: (template: Template) => void;
  onCancel?: () => void;
}

export default function TemplateEditor({ template, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    max_participants: template?.configuration?.max_participants?.toString() || '',
    auto_close_timeout_minutes: template?.configuration?.auto_close_timeout_minutes?.toString() || '',
    rules: template?.configuration?.rules || [],
  });

  const [newRule, setNewRule] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule.trim()],
    }));
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      configuration: {
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        auto_close_timeout_minutes: formData.auto_close_timeout_minutes ? parseInt(formData.auto_close_timeout_minutes) : undefined,
        rules: formData.rules,
      },
    };

    if (template?.id) {
      router.put(lecturer.sessionTemplates.update.url(template.id), payload, {
        onSuccess: () => {
          setIsSubmitting(false);
          onSave?.({ ...template, ...payload });
        },
        onError: () => setIsSubmitting(false),
      });
    } else {
      router.post(lecturer.sessionTemplates.store.url(), payload, {
        onSuccess: () => {
          setIsSubmitting(false);
          onSave?.(payload as Template);
        },
        onError: () => setIsSubmitting(false),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900">
          {template?.id ? 'Edit Template' : 'Create Template'}
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-600 hover:text-gray-500">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Standard Discussion Template"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Optional description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
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
              <Shield className="w-4 h-4 inline mr-1" />
              Auto-Close (minutes)
            </label>
            <input
              type="number"
              value={formData.auto_close_timeout_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, auto_close_timeout_minutes: e.target.value }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Disabled"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Rules
          </label>

          <div className="space-y-2 mb-3">
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="flex-1 text-sm text-gray-700">{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="text-gray-600 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add a rule..."
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-brand-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-brand-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
