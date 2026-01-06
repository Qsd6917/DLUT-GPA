import React, { useState, useEffect } from 'react';
import { X, Save, Star } from 'lucide-react';
import { Course, CourseType } from '../types';

interface EditCourseModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, credits: number, score: number, semester: string, type: CourseType, isCore: boolean) => void;
  existingSemesters: string[];
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, isOpen, onClose, onSave, existingSemesters }) => {
  const [name, setName] = useState(course.name);
  const [credits, setCredits] = useState(course.credits.toString());
  const [score, setScore] = useState(course.score.toString());
  const [semester, setSemester] = useState(course.semester || '');
  const [type, setType] = useState<CourseType>(course.type || '必修');
  const [isCore, setIsCore] = useState(course.isCore || false);

  // Reset form when course changes
  useEffect(() => {
    if (isOpen) {
      setName(course.name);
      setCredits(course.credits.toString());
      setScore(course.score.toString());
      setSemester(course.semester || '');
      setType(course.type || '必修');
      setIsCore(course.isCore || false);
    }
  }, [course, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credNum = parseFloat(credits);
    const scoreNum = parseFloat(score);
    
    if (!name.trim() || isNaN(credNum) || isNaN(scoreNum) || !semester.trim()) {
        alert("请填写完整的有效信息");
        return;
    }

    onSave(course.id, name.trim(), credNum, scoreNum, semester.trim(), type, isCore);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">编辑课程</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
                <input
                    type="text"
                    list="edit-semester-list"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <datalist id="edit-semester-list">
                    {existingSemesters.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">属性</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CourseType)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                    <option value="必修">必修</option>
                    <option value="选修">选修</option>
                    <option value="任选">任选</option>
                </select>
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学分</label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                step="0.5"
                min="0"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分数</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          
          {/* Core Course Toggle */}
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition-all" onClick={() => setIsCore(!isCore)}>
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isCore ? 'bg-yellow-500 border-yellow-600' : 'bg-white border-gray-300'}`}>
                  {isCore && <Star size={12} className="text-white fill-white" />}
              </div>
              <div className="select-none">
                  <span className="text-sm font-bold text-yellow-900">核心专业课</span>
                  <p className="text-xs text-yellow-700">标记为核心课程，用于保研筛选</p>
              </div>
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              <Save size={18} />
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};