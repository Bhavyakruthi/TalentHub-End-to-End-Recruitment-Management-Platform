import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Download,
  Star,
  Crown,
  Palette,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';

// Glassmorphism utility classes
const glass = "backdrop-blur-md bg-white/30 border border-white/30 shadow-xl";

const Templates = ({ onBack, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📄' },
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'modern', name: 'Modern', icon: '✨' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'classic', name: 'Classic', icon: '📋' }
  ];

  // Load templates from backend
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const res = await client.get('/api/jobseeker/resume/templates', {
          params: { category: selectedCategory }
        });
        if (res.data?.success) {
          setTemplates(res.data.templates);
        }
      } catch (e) {
        console.error('Error loading templates:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, [selectedCategory]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreviewTemplate = async (templateId) => {
    try {
      const res = await client.get(`/api/jobseeker/resume/templates/${templateId}`);
      if (res.data?.success) {
        setSelectedTemplate(res.data.template);
      }
    } catch (error) {
      console.error('Error loading template details:', error);
      toast.error('Failed to load template details');
    }
  };

  const handleUseTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      toast.success(`Template "${template.name}" selected! This would apply the template to your resume.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-teal-50 to-amber-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-teal-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-3 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 shadow-lg hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6 text-violet-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
              <p className="text-gray-600">Choose a professional template for your resume</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${glass} p-6 rounded-2xl mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full p-3 border-none rounded-xl bg-white/60 focus:ring-2 focus:ring-violet-400 font-medium shadow-inner transition"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 border-none rounded-xl bg-white/60 focus:ring-2 focus:ring-teal-400 font-medium shadow-inner transition"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.template_id}
              className={`${glass} rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
            >
              {/* Template Preview */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Preview</p>
                </div>
                {template.is_premium && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-6 h-6 text-amber-500" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                  {template.is_premium && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-semibold">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Palette className="w-3 h-3 mr-1" />
                    {template.category}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Just now
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreviewTemplate(template.template_id)}
                    className="flex-1 px-3 py-2 bg-violet-100 text-violet-700 rounded-lg font-semibold text-sm hover:bg-violet-200 transition"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-violet-400 to-teal-400 text-white rounded-lg font-semibold text-sm hover:scale-105 transition"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    Use
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Templates Message */}
        {filteredTemplates.length === 0 && (
          <div className={`${glass} p-12 rounded-2xl text-center`}>
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${glass} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Palette className="w-4 h-4 mr-1" />
                      {selectedTemplate.category}
                    </span>
                    {selectedTemplate.is_premium && (
                      <span className="flex items-center text-amber-600">
                        <Crown className="w-4 h-4 mr-1" />
                        Premium Template
                      </span>
                    )}
                  </div>
                </div>

                {/* Template Preview Area */}
                <div className="bg-white rounded-xl p-8 shadow-inner mb-6">
                  <div className="text-center text-gray-500">
                    <FileText className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                    <p>Template preview would be displayed here</p>
                    <p className="text-sm">This would show the actual template layout</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-400 to-teal-400 text-white rounded-xl font-semibold hover:scale-105 transition"
                  >
                    <Download className="w-5 h-5 inline mr-2" />
                    Use This Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
