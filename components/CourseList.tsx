import React, { useState, useMemo } from 'react';
import { Trash2, BookOpen, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Calculator, Ban } from 'lucide-react';
import { Course } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface CourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}

type SortKey = keyof Course;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`
      relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
      focus-visible:ring-indigo-600 focus-visible:ring-offset-2
      ${checked ? 'bg-indigo-600' : 'bg-gray-300 hover:bg-gray-400'}
    `}
  >
    <span className="sr-only">纳入计算</span>
    <span
      aria-hidden="true"
      className={`
        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 
        transition duration-200 ease-in-out
        ${checked ? 'translate-x-4' : 'translate-x-0'}
      `}
    />
  </button>
);

export const CourseList: React.FC<CourseListProps> = ({ courses, onRemove, onEdit, onToggle, onToggleAll }) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const allChecked = courses.length > 0 && courses.every(c => c.isActive);
  const someChecked = courses.some(c => c.isActive);
  const isIndeterminate = someChecked && !allChecked;

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCourses = useMemo(() => {
    if (!sortConfig) return courses;
    
    return [...courses].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [courses, sortConfig]);

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-indigo-600" />
      : <ArrowDown size={14} className="ml-1 text-indigo-600" />;
  };

  const HeaderCell = ({ label, sortKey, align = 'left', width }: { label: string, sortKey: SortKey, align?: string, width?: string }) => (
      <th 
        className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none text-${align} ${width}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''}`}>
            {label}
            {renderSortIcon(sortKey)}
        </div>
      </th>
  );
  
  const getTypeColor = (type: string) => {
      switch(type) {
          case '必修': return 'bg-blue-50 text-blue-600 border-blue-100';
          case '选修': return 'bg-purple-50 text-purple-600 border-purple-100';
          case '任选': return 'bg-amber-50 text-amber-600 border-amber-100';
          default: return 'bg-gray-50 text-gray-600 border-gray-100';
      }
  };

  const getTranslatedType = (type: string) => {
      switch(type) {
          case '必修': return t('type_compulsory');
          case '选修': return t('type_elective');
          case '任选': return t('type_optional');
          default: return type;
      }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-soft">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <BookOpen className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-medium mb-1">{t('no_data')}</h3>
        <p className="text-sm text-gray-500">{t('no_data_desc')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 w-16 text-center">
                <div className="flex items-center justify-center group relative">
                    <input 
                        type="checkbox"
                        checked={allChecked}
                        ref={input => {
                            if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => onToggleAll(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-all peer"
                    />
                     {/* Tooltip for Select All */}
                     <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-sm">
                        All / None
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                    </span>
                </div>
              </th>
              {/* Added w-24 to ensure semantic column doesn't wrap */}
              <HeaderCell label={t('semester')} sortKey="semester" width="w-24" />
              <HeaderCell label={t('course_name')} sortKey="name" />
              <HeaderCell label={t('credits')} sortKey="credits" />
              <HeaderCell label={t('score')} sortKey="score" />
              <HeaderCell label={t('gpa')} sortKey="gpa" />
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedCourses.map((course) => (
              <tr 
                key={course.id} 
                className={`group border-b border-gray-50/50 transition-all duration-300 ease-in-out ${
                    !course.isActive 
                        ? 'bg-gray-50 opacity-60 grayscale-[0.8] hover:grayscale-[0.5] hover:opacity-80' 
                        : 'bg-white hover:bg-blue-50/20'
                }`}
              >
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                        <ToggleSwitch checked={course.isActive} onChange={() => onToggle(course.id)} />
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border min-w-[3.5rem] shadow-sm tracking-wide transition-colors ${
                        course.isActive 
                            ? 'bg-slate-50 text-slate-600 border-slate-200' 
                            : 'bg-transparent text-gray-400 border-gray-200'
                    }`}>
                        {course.semester}
                    </span>
                </td>
                <td className="px-6 py-4">
                     <div className="flex flex-col">
                         <span className={`font-semibold text-sm tracking-tight transition-colors ${course.isActive ? 'text-gray-800' : 'text-gray-400 line-through decoration-gray-300'}`}>
                             {course.name}
                         </span>
                         <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded border mt-1 ${getTypeColor(course.type)}`}>
                             {getTranslatedType(course.type || '必修')}
                         </span>
                     </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs font-bold tabular-nums border transition-colors ${
                        course.isActive 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                        {course.credits}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`text-sm font-bold tabular-nums transition-colors ${
                        !course.isActive ? 'text-gray-400' :
                        course.score >= 90 ? 'text-emerald-600' : 
                        course.score < 60 ? 'text-red-500' : 
                        'text-gray-700'
                    }`}>
                        {course.score}
                    </span>
                </td>
                <td className="px-6 py-4">
                    {course.isActive ? (
                         <span className="text-sm font-bold text-gray-800 tabular-nums bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                            {course.gpa.toFixed(2)}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                             <Ban size={10} /> 
                             Excl
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onEdit(course)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                        title={t('edit_course')}
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        onClick={() => onRemove(course.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};