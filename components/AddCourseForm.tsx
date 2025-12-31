import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

interface AddCourseFormProps {
  onAdd: (name: string, credits: number, score: number, semester: string) => void;
  existingNames: string[];
  existingSemesters: string[];
}

export const AddCourseForm: React.FC<AddCourseFormProps> = ({ onAdd, existingNames, existingSemesters }) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [semester, setSemester] = useState('');

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
      if(!window.confirm(`课程 "${trimmedName}" 似乎已存在。确定要重复添加吗？`)) {
          return;
      }
    }

    const credNum = parseFloat(credits);
    const scoreNum = parseFloat(score);
    
    if (isNaN(credNum) || isNaN(scoreNum)) return;
    
    onAdd(trimmedName, credNum, scoreNum, semester);
    setName('');
    setCredits('');
    setScore('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-600 p-6 rounded-2xl shadow-md border border-indigo-500 mb-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <PlusCircle size={20} className="text-indigo-200" />
        添加新课程
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
            <label className="block text-sm font-medium text-indigo-100 mb-1">学期</label>
            <input 
                type="text"
                list="semester-list"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="例如: 2024-2025-1学期"
                className="w-full px-4 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm"
            />
            <datalist id="semester-list">
                {existingSemesters.map(s => <option key={s} value={s} />)}
            </datalist>
        </div>
        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-indigo-100 mb-1">课程名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：高等微积分"
            className="w-full px-4 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-indigo-100 mb-1">学分</label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="3.0"
            min="0"
            step="0.5"
            className="w-full px-4 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-indigo-100 mb-1">分数</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="95"
            min="0"
            max="100"
            className="w-full px-4 py-2 rounded-xl border border-transparent bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="md:col-span-12 mt-2">
          <button
            type="submit"
            className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-2 px-4 rounded-xl transition-colors shadow-lg"
          >
            添加
          </button>
        </div>
      </div>
    </form>
  );
};