import React, { useState, useMemo } from 'react';
import { X, Filter, Calculator, Check, ArrowRight, ShieldCheck, Dumbbell, BookOpen, Star, RefreshCcw } from 'lucide-react';
import { Course, CalculationMethod } from '../types';
import { calculateStats, calculateCourseGpa } from '../services/gpaService';
import { useTranslation } from '../contexts/LanguageContext';

interface ApplicationCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onUpdateCourse: (updated: Course) => void;
}

export const ApplicationCalculator: React.FC<ApplicationCalculatorProps> = ({ isOpen, onClose, courses, onUpdateCourse }) => {
  const { t } = useTranslation();
  
  const [excludeSports, setExcludeSports] = useState(false);
  const [excludePolitics, setExcludePolitics] = useState(false);
  const [excludeOptional, setExcludeOptional] = useState(false);
  const [coreOnly, setCoreOnly] = useState(false);
  const [wesMode, setWesMode] = useState(false);

  // Filter Logic
  const filteredCourses = useMemo(() => {
      let filtered = courses.filter(c => c.isActive);

      if (excludeSports) {
          filtered = filtered.filter(c => !c.name.includes('体育'));
      }
      if (excludePolitics) {
          const politicsKeywords = ['思想', '毛泽东', '马克思', '中国近现代', '形势与政策', '军事', '习近平'];
          filtered = filtered.filter(c => !politicsKeywords.some(k => c.name.includes(k)));
      }
      if (excludeOptional) {
          filtered = filtered.filter(c => c.type !== '任选');
      }
      if (coreOnly) {
          filtered = filtered.filter(c => c.isCore);
      }
      
      return filtered;
  }, [courses, excludeSports, excludePolitics, excludeOptional, coreOnly]);

  // Calculate Stats based on Filtered + WES override
  const stats = useMemo(() => {
      const processedCourses = filteredCourses.map(c => {
          if (wesMode) {
              return { ...c, gpa: calculateCourseGpa(c.score, CalculationMethod.WES) };
          }
          return c;
      });
      return calculateStats(processedCourses);
  }, [filteredCourses, wesMode]);

  // Calculate Original Stats for comparison (using same set but original method, or ALL courses?)
  // Usually comparison is against "All Active Courses" with standard method
  const originalStats = useMemo(() => {
      const active = courses.filter(c => c.isActive);
      return calculateStats(active);
  }, [courses]);

  if (!isOpen) return null;

  const toggleCore = (course: Course) => {
      onUpdateCourse({ ...course, isCore: !course.isCore });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                      <Calculator size={20} />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-gray-800">{t('app_calc_title')}</h3>
                      <p className="text-xs text-gray-500">针对保研/留学申请的高级算法模拟</p>
                  </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={20} />
              </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Sidebar: Filters & Stats */}
              <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 flex flex-col overflow-y-auto">
                  
                  {/* Stats Card */}
                  <div className="p-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4 text-center">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('app_gpa')}</div>
                          <div className="text-4xl font-black text-indigo-600 tracking-tight">
                              {stats.weightedGpa.toFixed(3)}
                          </div>
                          {wesMode && (
                              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                  WES 4.0
                              </div>
                          )}
                      </div>
                      
                      <div className="flex justify-between items-center px-2 text-sm text-gray-500">
                          <span>{t('original_gpa_short')}:</span>
                          <span className="font-semibold text-gray-700">{originalStats.weightedGpa.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between items-center px-2 text-sm text-gray-500 mt-1">
                          <span>{t('course_count')}:</span>
                          <span className="font-semibold text-gray-700">{filteredCourses.length} / {courses.filter(c=>c.isActive).length}</span>
                      </div>
                  </div>

                  <div className="px-6 pb-6 space-y-6">
                      <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Filter size={12} /> {t('app_filters')}
                          </h4>
                          <div className="space-y-2">
                              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-300 transition-all select-none">
                                  <input type="checkbox" checked={excludeSports} onChange={e => setExcludeSports(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                      <Dumbbell size={16} className="text-gray-400" />
                                      {t('filter_sports')}
                                  </div>
                              </label>
                              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-300 transition-all select-none">
                                  <input type="checkbox" checked={excludePolitics} onChange={e => setExcludePolitics(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                      <BookOpen size={16} className="text-gray-400" />
                                      {t('filter_politics')}
                                  </div>
                              </label>
                              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-300 transition-all select-none">
                                  <input type="checkbox" checked={excludeOptional} onChange={e => setExcludeOptional(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                      <RefreshCcw size={16} className="text-gray-400" />
                                      {t('filter_optional')}
                                  </div>
                              </label>
                              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-300 transition-all select-none">
                                  <input type="checkbox" checked={coreOnly} onChange={e => setCoreOnly(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                      {t('filter_core_only')}
                                  </div>
                              </label>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <ShieldCheck size={12} /> {t('wes_sim')}
                          </h4>
                          <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100 transition-all select-none">
                                  <input type="checkbox" checked={wesMode} onChange={e => setWesMode(e.target.checked)} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                  <div>
                                      <div className="text-sm font-bold text-purple-900">{t('wes_sim')}</div>
                                      <div className="text-[10px] text-purple-600 mt-0.5">WES 4.0 算法 (80-89=3.0)</div>
                                  </div>
                          </label>
                      </div>
                  </div>
              </div>

              {/* Main Content: Course List */}
              <div className="flex-1 bg-white flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h4 className="font-bold text-gray-700">{t('course_list')} ({filteredCourses.length})</h4>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span>点击星星标记核心专业课</span>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-16 text-center">{t('is_core')}</th>
                                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('course_name')}</th>
                                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">{t('score')}</th>
                                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20 text-right">GPA</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {filteredCourses.map(course => (
                                  <tr key={course.id} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="px-4 py-3 text-center">
                                          <button 
                                            onClick={() => toggleCore(course)}
                                            className={`p-1.5 rounded-full transition-all ${course.isCore ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-yellow-400'}`}
                                          >
                                              <Star size={16} className={course.isCore ? 'fill-yellow-500' : ''} />
                                          </button>
                                      </td>
                                      <td className="px-4 py-3">
                                          <div className="text-sm font-medium text-gray-800">{course.name}</div>
                                          <div className="text-xs text-gray-400 mt-0.5">{course.credits}学分 · {course.type}</div>
                                      </td>
                                      <td className="px-4 py-3 text-sm font-bold text-gray-700">{course.score}</td>
                                      <td className="px-4 py-3 text-sm font-bold text-indigo-600 text-right">
                                          {wesMode 
                                              ? calculateCourseGpa(course.score, CalculationMethod.WES).toFixed(2)
                                              : course.gpa.toFixed(2)
                                          }
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
