import React, { useState } from 'react';
import { PlusCircle, Star } from 'lucide-react';
import { CourseType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface AddCourseFormProps {
  onAdd: (name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => void;
  existingNames: string[];
  existingSemesters: string[];
}

export const AddCourseForm: React.FC<AddCourseFormProps> = ({ onAdd, existingNames, existingSemesters }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [semester, setSemester] = useState('');
  const [type, setType] = useState<CourseType>('必修');
  const [isCore, setIsCore] = useState(false);

  // Auto-fill semester with the most recent one if available
  React.useEffect(() => {
    if (existingSemesters.length > 0 && !semester) {
        setSemester(existingSemesters[existingSemesters.length - 1]);
    }
  }, [existingSemesters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !credits || !score || !semester) return;
    
    const trimmedName = name.trim();
    if (existingNames.includes(trimmedName)) {
      if(!window.confirm(`Course "${trimmedName}" seems to exist. Add duplicate?`)) {
          return;
      }
    }

    const credNum = parseFloat(credits);
    const scoreNum = parseFloat(score);
    
    if (isNaN(credNum) || isNaN(scoreNum)) return;
    
    onAdd(trimmedName, credNum, scoreNum, semester, type, isCore);
    setName('');
    setCredits('');
    setScore('');
    setIsCore(false); // Reset core status
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-600 p-6 rounded-2xl shadow-md border border-indigo-500 mb-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <PlusCircle size={20} className="text-indigo-200" />
        {t('add_course')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-indigo-100 mb-1">{t('semester')}</label>
            <input 
                type="text"
                list="semester-list"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="2024-2025-1"
                className="w-full px-3 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm text-sm"
            />
            <datalist id="semester-list">
                {existingSemesters.map(s => <option key={s} value={s} />)}
            </datalist>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-indigo-100 mb-1">{t('course_name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Calculus"
            className="w-full px-3 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm text-sm"
          />
        </div>
        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-indigo-100 mb-1">{t('type')}</label>
           <select
             value={type}
             onChange={(e) => setType(e.target.value as CourseType)}
             className="w-full px-3 py-2 rounded-xl border border-transparent bg-white text-gray-900 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm text-sm cursor-pointer"
           >
             <option value="必修">{t('type_compulsory')}</option>
             <option value="选修">{t('type_elective')}</option>
             <option value="任选">{t('type_optional')}</option>
           </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-indigo-100 mb-1">{t('is_core')}</label>
          <button 
            type="button" 
            onClick={() => setIsCore(!isCore)}
            className={`w-full h-[38px] rounded-xl flex items-center justify-center transition-all ${isCore ? 'bg-yellow-400 text-yellow-900 shadow-inner' : 'bg-indigo-700 text-indigo-300 hover:bg-indigo-500'}`}
            title="Mark as Core Course"
          >
              <Star size={18} className={isCore ? 'fill-yellow-900' : ''} />
          </button>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-indigo-100 mb-1">{t('credits')}</label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="3.0"
            min="0"
            step="0.5"
            className="w-full px-3 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-indigo-100 mb-1">{t('score')}</label>
          <div className="flex gap-2">
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="95"
                min="0"
                max="100"
                className="w-full px-3 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm text-sm"
              />
              <button
                type="submit"
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold p-2 rounded-xl transition-colors shadow-lg flex items-center justify-center aspect-square"
                title="Add"
              >
                <PlusCircle size={20} />
              </button>
          </div>
        </div>
      </div>
    </form>
  );
};