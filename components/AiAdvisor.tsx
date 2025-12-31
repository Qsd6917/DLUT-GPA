import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Course, GpaStats } from '../types';
import { getAcademicAdvice } from '../services/geminiService';

interface AiAdvisorProps {
  courses: Course[];
  stats: GpaStats;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ courses, stats }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<{ analysis: string; suggestions: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerateAdvice = async () => {
    if (courses.length === 0) {
      setError("请先添加一些课程。");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await getAcademicAdvice(courses, stats);
      setAdvice(result);
    } catch (err) {
      setError("当前无法生成建议。请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Gemini 智能学业导师</h3>
              <p className="text-indigo-100 text-sm">基于您的成绩提供个性化分析</p>
            </div>
          </div>
        </div>

        {!advice && !loading && (
          <div className="text-center py-8">
            <p className="text-indigo-100 mb-6">
              获取 AI 驱动的 GPA 趋势分析、优势评估以及可行的改进建议。
            </p>
            <button
              onClick={handleGenerateAdvice}
              className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              分析我的成绩单
            </button>
            {error && <p className="text-red-300 mt-4 text-sm bg-red-900/20 py-2 rounded-lg">{error}</p>}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-white mb-4" size={32} />
            <p className="text-indigo-100 animate-pulse">正在分析您的学业表现...</p>
          </div>
        )}

        {advice && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fade-in">
            <h4 className="font-semibold text-lg text-white mb-2">学业分析</h4>
            <p className="text-indigo-50 leading-relaxed mb-6 text-sm">{advice.analysis}</p>
            
            <h4 className="font-semibold text-lg text-white mb-3">提升建议</h4>
            <ul className="space-y-2">
              {advice.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-indigo-50">
                  <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">{index + 1}</span>
                  {suggestion}
                </li>
              ))}
            </ul>
            
            <div className="mt-6 text-center">
                <button 
                    onClick={() => setAdvice(null)}
                    className="text-xs text-indigo-200 hover:text-white underline decoration-dashed"
                >
                    清除分析
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
