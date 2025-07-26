import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Award,
  Lightbulb,
  Download,
  RotateCcw
} from 'lucide-react';

// Glassmorphism and elegant color palette
const glassBg = "bg-white/30 backdrop-blur-md border border-white/30 shadow-xl";
const glassCard = `rounded-2xl ${glassBg} p-6 transition-shadow hover:shadow-2xl`;
const accent = "from-[#f8fafc] via-[#f1f5f9] to-[#e0e7ef]";
const gradientText = "bg-gradient-to-r from-[#7f53ac] via-[#647dee] to-[#43cea2] bg-clip-text text-transparent";
const accentBtn = "bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white shadow-lg hover:scale-105 transition-transform";
const accentBtn2 = "bg-gradient-to-r from-[#f7971e] to-[#ffd200] text-gray-900 shadow-lg hover:scale-105 transition-transform";
const subtleText = "text-gray-700/80";
const glassInput = "bg-white/40 backdrop-blur rounded-lg border border-white/30 focus:ring-2 focus:ring-[#43cea2] focus:border-[#43cea2] transition-all";

const ATS = () => {
  const [uploadedResume, setUploadedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedResume(file);
      setTimeout(() => {
        setAnalysis({
          overallScore: 78,
          keywordMatch: 65,
          formatting: 85,
          completeness: 80,
          readability: 90,
          suggestions: [
            {
              type: 'critical',
              message: 'Add more relevant keywords like "React", "Node.js", and "TypeScript"',
              impact: 'High'
            },
            {
              type: 'warning',
              message: 'Consider adding quantifiable achievements in your experience section',
              impact: 'Medium'
            },
            {
              type: 'info',
              message: 'Your contact information is well-formatted',
              impact: 'Low'
            }
          ],
          matchedKeywords: ['JavaScript', 'Frontend', 'HTML', 'CSS', 'Git'],
          missingKeywords: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
          sections: {
            contact: { score: 95, status: 'excellent' },
            summary: { score: 70, status: 'good' },
            experience: { score: 75, status: 'good' },
            education: { score: 90, status: 'excellent' },
            skills: { score: 60, status: 'needs_improvement' }
          }
        });
      }, 2000);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedResume || !jobDescription) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#43cea2]';
    if (score >= 60) return 'text-[#ffd200]';
    return 'text-[#ff5858]';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-[#43cea2]/20';
    if (score >= 60) return 'bg-[#ffd200]/20';
    return 'bg-[#ff5858]/20';
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-[#ff5858] animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#ffd200] animate-bounce" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-[#43cea2] animate-fade-in" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSectionStatus = (status) => {
    switch (status) {
      case 'excellent':
        return { color: 'text-[#43cea2]', bg: 'bg-[#43cea2]/20', text: 'Excellent' };
      case 'good':
        return { color: 'text-[#ffd200]', bg: 'bg-[#ffd200]/20', text: 'Good' };
      case 'needs_improvement':
        return { color: 'text-[#ff5858]', bg: 'bg-[#ff5858]/20', text: 'Needs Improvement' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  return (
    <div className={`min-h-screen py-10 px-2 md:px-8 bg-gradient-to-br ${accent} relative`}>
      {/* Glassy floating shapes for effect */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#43cea2]/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-[#ffd200]/20 rounded-full blur-3xl animate-float2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#7f53ac]/20 rounded-full blur-2xl animate-float3" />
      </div>
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold ${gradientText} tracking-tight drop-shadow-lg`}>
              ATS Resume Scanner
            </h1>
            <p className={`mt-1 ${subtleText} text-lg font-medium`}>
              Optimize your resume to pass Applicant Tracking Systems
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button className={`px-5 py-2 rounded-xl font-semibold shadow-md ${accentBtn2} flex items-center gap-2`}>
              <Target className="w-5 h-5" />
              Resume Tips
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resume Upload */}
            <div className={glassCard}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Resume</h3>
              <div className="border-2 border-dashed border-white/40 rounded-2xl p-8 text-center bg-white/10 hover:bg-white/20 transition-all duration-300">
                <Upload className="w-14 h-14 text-[#43cea2] mx-auto mb-4 animate-bounce" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {uploadedResume ? uploadedResume.name : 'Drop your resume here'}
                </h4>
                <p className={`${subtleText} mb-4`}>
                  {uploadedResume
                    ? <span className="text-[#43cea2] font-semibold animate-fade-in">Resume uploaded successfully!</span>
                    : 'Drag and drop your resume file or click to browse'
                  }
                </p>
                <input
                  type="file"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="resume-upload"
                  className={`px-5 py-2 rounded-xl font-semibold cursor-pointer ${accentBtn} inline-block`}
                >
                  {uploadedResume ? 'Change Resume' : 'Choose File'}
                </label>
                <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX</p>
              </div>
            </div>

            {/* Job Description */}
            <div className={glassCard}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description <span className="text-xs text-gray-400">(Optional)</span></h3>
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className={`w-full p-3 ${glassInput} text-gray-900 font-medium`}
                placeholder="Paste the job description here to get targeted optimization suggestions..."
              />
              <div className="mt-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Adding a job description will provide more targeted feedback
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={!uploadedResume || loading}
                  className={`px-5 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-md ${accentBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-8">
                {/* Overall Score */}
                <div className={glassCard}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">ATS Compatibility Score</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-36 h-36">
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          className="text-white/40"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke="url(#score-gradient)"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 62}`}
                          strokeDashoffset={`${2 * Math.PI * 62 * (1 - analysis.overallScore / 100)}`}
                          className={getScoreColor(analysis.overallScore)}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)' }}
                        />
                        <defs>
                          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#43cea2" />
                            <stop offset="100%" stopColor="#185a9d" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-4xl font-extrabold ${getScoreColor(analysis.overallScore)} animate-fade-in`}>
                            {analysis.overallScore}%
                          </div>
                          <div className="text-sm text-gray-600">ATS Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.keywordMatch)}`}>
                        {analysis.keywordMatch}%
                      </div>
                      <div className="text-sm text-gray-600">Keywords</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.formatting)}`}>
                        {analysis.formatting}%
                      </div>
                      <div className="text-sm text-gray-600">Formatting</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.completeness)}`}>
                        {analysis.completeness}%
                      </div>
                      <div className="text-sm text-gray-600">Completeness</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.readability)}`}>
                        {analysis.readability}%
                      </div>
                      <div className="text-sm text-gray-600">Readability</div>
                    </div>
                  </div>
                </div>

                {/* Section Analysis */}
                <div className={glassCard}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Section Analysis</h3>
                  <div className="space-y-4">
                    {Object.entries(analysis.sections).map(([section, data]) => {
                      const status = getSectionStatus(data.status);
                      return (
                        <div key={section} className="flex items-center justify-between p-4 border border-white/20 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getScoreBg(data.score)}`}></div>
                            <span className="font-medium text-gray-900 capitalize">
                              {section.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                              {status.text}
                            </span>
                            <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                              {data.score}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Keywords Analysis */}
                <div className={glassCard}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Keyword Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[#43cea2] mb-3">Found Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.matchedKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#43cea2]/20 text-[#43cea2] animate-fade-in"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#ff5858] mb-3">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ff5858]/20 text-[#ff5858] animate-fade-in"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Sidebar */}
          <div className="space-y-8">
            {analysis && (
              <div className={glassCard}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#ffd200]" />
                  Optimization Suggestions
                </h3>
                <div className="space-y-4">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-white/20 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{suggestion.message}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${
                          suggestion.impact === 'High'
                            ? 'bg-[#ff5858]/20 text-[#ff5858]'
                            : suggestion.impact === 'Medium'
                            ? 'bg-[#ffd200]/20 text-[#ffd200]'
                            : 'bg-[#43cea2]/20 text-[#43cea2]'
                        }`}>
                          {suggestion.impact} Impact
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className={`w-full px-4 py-2 rounded-xl font-semibold ${accentBtn2} flex items-center gap-2`}>
                    <Download className="w-4 h-4" />
                    Download Detailed Report
                  </button>
                </div>
              </div>
            )}

            {/* ATS Tips */}
            <div className={glassCard}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#43cea2]" />
                ATS Optimization Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43cea2] mt-0.5 flex-shrink-0" />
                  <p>Use standard section headings like "Experience" and "Education"</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43cea2] mt-0.5 flex-shrink-0" />
                  <p>Include relevant keywords from the job description</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43cea2] mt-0.5 flex-shrink-0" />
                  <p>Avoid images, charts, and complex formatting</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43cea2] mt-0.5 flex-shrink-0" />
                  <p>Use a clean, simple font like Arial or Calibri</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43cea2] mt-0.5 flex-shrink-0" />
                  <p>Save your resume as both PDF and Word formats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1);}
          50% { transform: translateY(-20px) scale(1.05);}
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) scale(1);}
          50% { transform: translateY(20px) scale(1.1);}
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0) scale(1);}
          50% { transform: translateX(-20px) scale(1.08);}
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float2 { animation: float2 9s ease-in-out infinite; }
        .animate-float3 { animation: float3 11s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(.4,2,.6,1); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default ATS;
