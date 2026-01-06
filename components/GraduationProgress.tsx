import React, { useState, useEffect, useMemo } from 'react';
import { Flag, Settings2, CalendarClock, Trophy, ChevronRight, X } from 'lucide-react';
import { Course, GraduationRequirements } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface GraduationProgressProps {
  courses: Course[];
  totalCredits: number;
}

const DEFAULT_REQUIREMENTS: GraduationRequirements = {
  total: 160,
  compulsory: 100,
  elective: 30,
  optional: 10
};

export const GraduationProgress: React.FC<GraduationProgressProps> = ({ courses, totalCredits }) => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<GraduationRequirements>(DEFAULT_REQUIREMENTS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showMilestone, setShowMilestone] = useState<string | null>(null);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem('dlut_grad_reqs');
    if (saved) {
      try {
        setRequirements(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load graduation requirements");
      }
    }
  }, []);

  // Save settings
  const handleSaveSettings = (newReqs: GraduationRequirements) => {
    setRequirements(newReqs);
    localStorage.setItem('dlut_grad_reqs', JSON.stringify(newReqs));
    setIsSettingsOpen(false);
  };

  // Calculate credits by type
  const creditsByType = useMemo(() => {
    return courses.reduce((acc, course) => {
      if (!course.isActive) return acc;
      const type = course.type || '必修';
      acc[type] = (acc[type] || 0) + course.credits;
      return acc;
    }, { '必修': 0, '选修': 0, '任选': 0 } as Record<string, number>);
  }, [courses]);

  // Prediction Logic
  const prediction = useMemo(() => {
    const uniqueSemesters = new Set(courses.map(c => c.semester)).size;
    if (uniqueSemesters === 0) return { avg: 0, left: 0 };
    
    // Simple logic: Total Credits / Semesters Count = Avg Velocity
    // We assume students want to reach TOTAL requirement
    const avgPerSemester = totalCredits / uniqueSemesters;
    const remaining = Math.max(0, requirements.total - totalCredits);
    const semestersLeft = avgPerSemester > 0 ? Math.ceil(remaining / avgPerSemester) : 0;
    
    return { avg: avgPerSemester, left: semestersLeft };
  }, [courses, totalCredits, requirements.total]);

  // Milestone check (Simple effect)
  const percentComplete = Math.min(100, (totalCredits / requirements.total) * 100);
  
  useEffect(() => {
      // Logic to trigger only once per session could be added, but for now we just check simple thresholds
      // This is a simplified "animation trigger" logic. 
      // In a real app we might track "lastSeenPercent" to only trigger on increase.
  }, [percentComplete]);

  const ProgressBar = ({ label, current, target, colorClass }: { label: string, current: number, target: number, colorClass: string }) => {
      const pct = Math.min(100, Math.max(0, (current / target) * 100));
      return (
          <div className="mb-3">
              <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                  <span>{label}</span>
                  <span className={current >= target ? 'text-emerald-600' : 'text-gray-500'}>
                      {current.toFixed(1)} / {target}
                  </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass} ${current >= target ? 'opacity-80' : ''}`}
                    style={{ width: `${pct}%` }}
                  ></div>
              </div>
          </div>
      );
  };

  if (isSettingsOpen) {
      return (
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">{t('grad_settings')}</h3>
                  <button onClick={() => setIsSettingsOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600"/></button>
              </div>
              <div className="space-y-3">
                  {Object.keys(DEFAULT_REQUIREMENTS).map((key) => {
                      const k = key as keyof GraduationRequirements;
                      const labelMap: Record<string, string> = {
                          total: t('grad_total_req'),
                          compulsory: t('grad_compulsory_req'),
                          elective: t('grad_elective_req'),
                          optional: t('grad_optional_req')
                      };
                      return (
                          <div key={key}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{labelMap[key]}</label>
                              <input 
                                type="number" 
                                value={requirements[k]} 
                                onChange={(e) => setRequirements({...requirements, [k]: parseFloat(e.target.value) || 0})}
                                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                      )
                  })}
                  <button 
                    onClick={() => handleSaveSettings(requirements)}
                    className="w-full mt-2 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                  >
                      {t('save_settings')}
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 transition-all hover:shadow-md relative overflow-hidden group">
      {/* Confetti / Celebration decoration for milestones */}
      {percentComplete >= 100 && (
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Trophy size={100} className="text-yellow-500 rotate-12" />
          </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Flag size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{t('grad_tracker')}</h3>
        </div>
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
        >
            <Settings2 size={18} />
        </button>
      </div>

      {/* Main Big Progress */}
      <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                   <circle 
                        cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray={175.93} // 2 * pi * 28
                        strokeDashoffset={175.93 - (percentComplete / 100) * 175.93}
                        className={`text-indigo-600 transition-all duration-1000 ease-out ${percentComplete >= 100 ? 'text-emerald-500' : ''}`} 
                        strokeLinecap="round"
                    />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                   {Math.floor(percentComplete)}%
               </div>
          </div>
          <div className="flex-1">
              {percentComplete >= 100 ? (
                  <div className="text-sm font-bold text-emerald-600 animate-pulse">
                      {t('grad_done')}
                  </div>
              ) : (
                  <>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{t('grad_prediction')}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-800 font-medium leading-tight">
                        <CalendarClock size={16} className="text-indigo-500 shrink-0" />
                        <span>
                           {t('grad_prediction_desc', prediction.avg.toFixed(1), prediction.left)}
                        </span>
                    </div>
                  </>
              )}
          </div>
      </div>

      <div className="space-y-1">
          <ProgressBar label={t('grad_total_req')} current={totalCredits} target={requirements.total} colorClass="bg-indigo-600" />
          <ProgressBar label={t('grad_compulsory_req')} current={creditsByType['必修']} target={requirements.compulsory} colorClass="bg-blue-500" />
          <ProgressBar label={t('grad_elective_req')} current={creditsByType['选修']} target={requirements.elective} colorClass="bg-purple-500" />
          <ProgressBar label={t('grad_optional_req')} current={creditsByType['任选']} target={requirements.optional} colorClass="bg-amber-500" />
      </div>

      {/* Milestone Badge - only show if recently crossed? For now just static conditional */}
      {percentComplete >= 50 && percentComplete < 80 && (
          <div className="mt-4 py-2 px-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs text-indigo-700 font-bold">
              <Trophy size={14} className="text-indigo-500" />
              {t('grad_milestone_50')}
          </div>
      )}
      {percentComplete >= 80 && percentComplete < 100 && (
          <div className="mt-4 py-2 px-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2 text-xs text-amber-700 font-bold">
              <Trophy size={14} className="text-amber-500" />
              {t('grad_milestone_80')}
          </div>
      )}

    </div>
  );
};
